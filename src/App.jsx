import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Lock, Unlock, LogOut, CalendarDays, Kanban, List as ListIcon, 
  Upload, Download, Plus, Edit2, Trash2, X, AlertCircle, Cake, 
  MessageCircle, Target, TrendingUp, Users, Activity, CheckCircle, Clock
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

// === ВАШИ НАСТРОЙКИ FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyAJroZn4GiNALqV36xq9ge1AJy2NXX_7qY",
  authDomain: "toffee-reminder-crm.firebaseapp.com",
  projectId: "toffee-reminder-crm",
  storageBucket: "toffee-reminder-crm.firebasestorage.app",
  messagingSenderId: "696144929354",
  appId: "1:696144929354:web:52d3f45894271781d2bcb3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'toffee-crm';

const initialCatalog = [
  "МОЛОЧНАЯ ДЕВОЧКА", "ШОКОЛАДНЫЙ ПЛОМБИР", "СНИКЕРС", "НУТЕЛЛА", "НАПОЛЕОН", 
  "МЕДОВИК", "ЧИЗКЕЙК ИСПАНСКИЙ", "ПИРОГ 23СМ", "ПИРОГ 18СМ", "ТРАЙФЛ", 
  "БЕНТО ТОРТ", "ФРЕЗЬЕ", "МАКАРОНС", "ЭКЛЕР", "МОТИ"
];
const statusColumns = ["Не связались", "Думает", "Внесена предоплата", "Завершен"];

export default function App() {
  const [user, setUser] = useState(null);
  // 'logged_out', 'owner', 'employee', 'guest'
  const [authState, setAuthState] = useState('logged_out');
  const [currentUserConfig, setCurrentUserConfig] = useState({ name: '', role: '' });
  const [showAccessModal, setShowAccessModal] = useState(false);

  const [clients, setClients] = useState([]);
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, kanban, list, calendar
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCake, setFilterCake] = useState('All');
  
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [touchModal, setTouchModal] = useState({ show: false, client: null, relative: null });

  // === ИНИЦИАЛИЗАЦИЯ FIREBASE ===
  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const clientsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'clients');
    const unsubscribe = onSnapshot(clientsRef, (snapshot) => {
      const loaded = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          clientName: data.clientName || "",
          phone: data.phone || "",
          clientBirthday: data.clientBirthday || "", // YYYY-MM-DD
          purchasedItems: Array.isArray(data.purchasedItems) ? data.purchasedItems : [],
          currentOrderStatus: data.currentOrderStatus || "Не связались",
          totalPrice: Number(data.totalPrice) || 0,
          manager: data.manager || "Не назначен",
          relatives: Array.isArray(data.relatives) ? data.relatives : [],
          logs: Array.isArray(data.logs) ? data.logs : [] // История касаний
        });
      });
      setClients(loaded);
    });
    return () => unsubscribe();
  }, [user]);

  // === ЗАЩИТА ДЕЙСТВИЙ ===
  const handleProtectedAction = (actionFn) => {
    if (authState === 'guest') { setShowAccessModal(true); return; }
    actionFn();
  };

  // === ФИЛЬТРАЦИЯ ===
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (c.clientName?.toLowerCase().includes(q)) || (c.phone?.toLowerCase().includes(q));
      const matchFilter = filterCake === 'All' || c.purchasedItems.some(i => i.toUpperCase() === filterCake.toUpperCase());
      return matchSearch && matchFilter;
    });
  }, [clients, searchQuery, filterCake]);

  // === ЛОГИКА СОХРАНЕНИЯ ===
  const saveClient = async (clientData) => {
    handleProtectedAction(async () => {
      const id = clientData.id || Date.now().toString();
      try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id), {
          ...clientData, id, manager: clientData.manager || currentUserConfig.name
        });
        setShowForm(false); setEditingClient(null);
      } catch (e) { console.error("Save error:", e); }
    });
  };

  const logTouch = async (clientId, status, note) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const newLog = {
      date: new Date().toISOString(),
      manager: currentUserConfig.name,
      status, note
    };
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), {
        ...client, logs: [...(client.logs || []), newLog]
      });
      setTouchModal({ show: false, client: null, relative: null });
    } catch(e) { console.error(e); }
  };

  // === УМНЫЙ ИМПОРТ (с поддержкой разных дат) ===
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const delimiter = text.includes(';') ? ';' : ',';
      const lines = text.split('\n').filter(line => line.trim());
      const dataLines = lines.slice(1);
      
      dataLines.forEach(async (line, idx) => {
        const row = line.split(delimiter).map(cell => cell ? cell.trim().replace(/^"|"$/g, '') : "");
        let formattedDate = "";
        if (row[2]) {
          const dStr = row[2];
          if (/^\d{1,2}\.\d{1,2}$/.test(dStr)) {
            const [d, m] = dStr.split('.'); formattedDate = `2026-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
          } else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dStr)) {
             const [d, m, y] = dStr.split('.'); formattedDate = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
          } else { formattedDate = dStr; }
        }
        
        const newClient = {
          id: `imp-${Date.now()}-${idx}`,
          clientName: row[0] || "Без имени",
          phone: row[1] || "",
          clientBirthday: formattedDate,
          purchasedItems: row[3] ? row[3].split(',').map(i=>i.trim()) : [],
          currentOrderStatus: "Не связались", totalPrice: 0,
          manager: currentUserConfig.name || "Система",
          relatives: [], logs: []
        };
        try { await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', newClient.id), newClient); } 
        catch(err) {}
      });
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  // === РЕНДЕР АВТОРИЗАЦИИ ===
  if (authState === 'logged_out') {
    return <AuthScreen onLogin={(role, name) => { setAuthState(role); setCurrentUserConfig({role, name}); }} />;
  }

  // === ГЛАВНЫЙ РЕНДЕР ===
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 p-2 rounded-xl"><Cake className="w-6 h-6 text-rose-500" /></div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-tight">Toffee CRM</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUserConfig.name} ({authState})</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setViewMode('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${viewMode === 'dashboard' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Activity className="w-4 h-4"/> Дашборд</button>
           <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${viewMode === 'calendar' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><CalendarDays className="w-4 h-4"/> Календарь</button>
           <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${viewMode === 'kanban' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Kanban className="w-4 h-4"/> Доска</button>
           <button onClick={() => setAuthState('logged_out')} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"><LogOut className="w-5 h-5"/></button>
        </div>
      </header>

      {/* МЕЙН КОНТЕНТ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Панель управления (скрыта на форме) */}
        {!showForm && viewMode !== 'dashboard' && (
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={() => handleProtectedAction(() => { setEditingClient(null); setShowForm(true); })} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md shadow-rose-500/20">
              <Plus className="w-5 h-5" /> Новый клиент
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Поиск (Имя, Телефон)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none font-medium" />
            </div>
            {authState === 'owner' && (
              <div className="relative">
                <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={(e) => handleProtectedAction(() => handleImportCSV(e))} />
                <button onClick={() => document.getElementById('csv-upload').click()} className="h-full bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition"><Upload className="w-4 h-4" /> Импорт</button>
              </div>
            )}
          </div>
        )}

        {/* РОУТИНГ ВИДОВ */}
        {showForm ? (
          <ClientForm 
             client={editingClient} 
             onSave={saveClient} 
             onCancel={() => setShowForm(false)} 
             catalog={initialCatalog} 
          />
        ) : (
          <>
            {viewMode === 'dashboard' && authState === 'employee' && <EmployeeDashboard clients={clients} onTouch={(c, rel) => setTouchModal({show: true, client: c, relative: rel})} />}
            {viewMode === 'dashboard' && authState === 'owner' && <OwnerDashboard clients={clients} />}
            {viewMode === 'dashboard' && authState === 'guest' && <div className="text-center py-20 text-slate-500">Гостевой режим. Перейдите в Календарь или Доску.</div>}
            
            {viewMode === 'kanban' && <KanbanBoard clients={filteredClients} onStatusChange={(id, st) => handleProtectedAction(async () => { const c = clients.find(x=>x.id===id); if(c) await setDoc(doc(db,'artifacts',APP_ID,'public','data','clients',id), {...c, currentOrderStatus: st}); })} onEdit={(c) => { setEditingClient(c); setShowForm(true); }}/>}
            {viewMode === 'calendar' && <CalendarView clients={filteredClients} />}
          </>
        )}
      </main>

      {/* МОДАЛКА КАСАНИЯ (Обработка) */}
      {touchModal.show && (
        <TouchModal 
          client={touchModal.client} 
          relative={touchModal.relative} 
          onClose={() => setTouchModal({show: false, client: null, relative: null})} 
          onSave={(status, note) => logTouch(touchModal.client.id, status, note)}
        />
      )}

      {/* МОДАЛКА ДОСТУПА */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800 mb-2">Демо-режим</h3>
            <p className="text-slate-500 mb-6 font-medium">Для редактирования необходимо войти под учетной записью.</p>
            <button onClick={() => setShowAccessModal(false)} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition">Понятно</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   КОМПОНЕНТЫ: АВТОРИЗАЦИЯ
   ========================================== */
function AuthScreen({ onLogin }) {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login === 'Toffee2026' && pass === 'crm0803') onLogin('owner', 'Владелец');
    else if (login === 'Manager' && pass === 'crm123') onLogin('employee', 'Менеджер 1');
    else setErr('Неверные данные');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4"><Cake className="w-8 h-8 text-rose-500" /></div>
          <h2 className="text-3xl font-black text-slate-800">Toffee CRM</h2>
          <p className="text-sm font-bold text-slate-400 uppercase mt-2">B2B Enterprise</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Логин (Toffee2026 или Manager)" value={login} onChange={e=>setLogin(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium" />
          <input type="password" placeholder="Пароль" value={pass} onChange={e=>setPass(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium" />
          {err && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{err}</p>}
          <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition flex justify-center items-center gap-2"><Unlock className="w-5 h-5"/> Войти в систему</button>
        </form>
        <button onClick={() => onLogin('guest', 'Гость')} className="w-full mt-4 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition hover:bg-slate-50">Демо-вход</button>
      </div>
    </div>
  );
}

/* ==========================================
   КОМПОНЕНТЫ: ФОРМА КЛИЕНТА (UI/UX FIX)
   ========================================== */
function ClientForm({ client, onSave, onCancel, catalog }) {
  const [formData, setFormData] = useState(client || {
    clientName: '', phone: '+7 ', clientBirthday: '', purchasedItems: [], relatives: []
  });

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-black text-slate-800">{client ? 'Редактировать' : 'Новый клиент'}</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-6 h-6"/></button>
      </div>
      
      {/* РЕШЕНИЕ ТЗ 1: Дата рождения в основном блоке */}
      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 mb-8">
        <h3 className="font-bold text-rose-600 mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> Основная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Имя</label>
            <input required type="text" className="w-full p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 outline-none" value={formData.clientName} onChange={e=>setFormData({...formData, clientName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Телефон</label>
            <input required type="text" className="w-full p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 outline-none" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-rose-600 uppercase mb-1">Дата рождения (Важно!)</label>
            <input type="date" className="w-full p-3 rounded-xl border border-rose-300 bg-white font-bold text-rose-700 focus:ring-2 focus:ring-rose-400 outline-none" value={formData.clientBirthday} onChange={e=>setFormData({...formData, clientBirthday: e.target.value})} />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-black text-lg hover:bg-slate-900 transition">СОХРАНИТЬ КЛИЕНТА</button>
    </form>
  );
}

/* ==========================================
   КОМПОНЕНТЫ: КАЛЕНДАРЬ (РЕКУРРЕНТНЫЙ + ВОЗРАСТ)
   ========================================== */
function CalendarView({ clients }) {
  const [calendarDate, setCalendarDate] = useState(new Date());

  const renderDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay() - 1; if (startDay === -1) startDay = 6;
    
    const blanks = Array.from({ length: startDay }).map((_, i) => <div key={`b-${i}`} className="min-h-[100px]"></div>);
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const d = i + 1;
      const currentMMDD = `${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      
      const events = [];
      // РЕШЕНИЕ ТЗ 2: Поиск по Дню и Месяцу (MM-DD), игнорируя год.
      clients.forEach(c => {
        if (c.clientBirthday && c.clientBirthday.length >= 10) {
          const bdayMMDD = c.clientBirthday.substring(5, 10);
          if (bdayMMDD === currentMMDD) {
             // РАСЧЕТ ВОЗРАСТА: Текущий год календаря - Год рождения
             const birthYear = parseInt(c.clientBirthday.substring(0, 4));
             const age = !isNaN(birthYear) ? year - birthYear : null;
             events.push({ name: c.clientName || c.phone, age, type: 'ДР Клиента' });
          }
        }
        (c.relatives || []).forEach(rel => {
          if (rel.eventDate && rel.eventDate.substring(5, 10) === currentMMDD) {
             const birthYear = parseInt(rel.eventDate.substring(0, 4));
             const age = !isNaN(birthYear) ? year - birthYear : null;
             events.push({ name: `${rel.name || 'Близкий'} (${rel.relation})`, age, type: rel.eventType });
          }
        });
      });

      return (
        <div key={d} className={`min-h-[100px] p-2 rounded-xl border flex flex-col ${events.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
          <span className={`text-sm font-bold ${events.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{d}</span>
          <div className="mt-1 flex flex-col gap-1 overflow-y-auto">
            {events.map((ev, idx) => (
              <div key={idx} className="text-[10px] bg-rose-500 text-white rounded p-1 shadow-sm leading-tight">
                <span className="font-bold">{ev.name}</span>
                {ev.age > 0 && <span className="opacity-90"> ({ev.age} л.)</span>}
              </div>
            ))}
          </div>
        </div>
      );
    });
    return [...blanks, ...days];
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl flex items-center gap-2"><CalendarDays className="text-rose-500" /> Ежегодные события</h3>
        <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-2 hover:bg-white rounded-lg font-bold transition">&larr;</button>
          <span className="font-black w-36 text-center uppercase text-sm">{calendarDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-2 hover:bg-white rounded-lg font-bold transition">&rarr;</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center font-bold text-slate-400 text-xs uppercase py-2">{d}</div>)}
        {renderDays()}
      </div>
    </div>
  );
}

/* ==========================================
   КОМПОНЕНТЫ: ДАШБОРД СОТРУДНИКА (To-Do)
   ========================================== */
function EmployeeDashboard({ clients, onTouch }) {
  // Ищем события на сегодня и завтра (упрощенно)
  const today = new Date();
  const todayMMDD = `${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
  
  const upcomingEvents = [];
  clients.forEach(c => {
    if (c.clientBirthday && c.clientBirthday.substring(5,10) === todayMMDD) {
      upcomingEvents.push({ client: c, type: 'День рождения (Клиент)' });
    }
  });

  // Подсчет статистики менеджера
  const myClients = clients; // В MVP считаем, что видит всех, или фильтруем по c.manager
  const missingDatesCount = myClients.filter(c => !c.clientBirthday).length;
  
  // Подсчет логов за сегодня
  let touchesToday = 0;
  const todayStr = today.toISOString().substring(0,10);
  myClients.forEach(c => {
     (c.logs || []).forEach(l => { if (l.date.startsWith(todayStr)) touchesToday++; });
  });

  return (
    <div className="space-y-6">
      {/* Метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl"><CheckCircle className="text-green-600 w-6 h-6"/></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase">Касания (Сегодня)</p><p className="text-2xl font-black">{touchesToday}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl"><AlertCircle className="text-amber-600 w-6 h-6"/></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase">Пустые даты (Слепая зона)</p><p className="text-2xl font-black">{missingDatesCount}</p></div>
        </div>
      </div>

      {/* To-Do Лист */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50"><h3 className="font-black text-lg flex items-center gap-2"><Clock className="text-blue-500 w-5 h-5"/> События на сегодня</h3></div>
        <div className="p-0">
          {upcomingEvents.length === 0 ? (
            <p className="p-6 text-center text-slate-500 font-medium">На сегодня задач нет!</p>
          ) : (
            upcomingEvents.map((ev, i) => (
              <div key={i} className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-slate-100 hover:bg-slate-50 transition">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{ev.client.clientName || ev.client.phone}</h4>
                  <p className="text-sm text-slate-500">{ev.type}</p>
                </div>
                <button onClick={() => onTouch(ev.client, null)} className="mt-4 md:mt-0 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-[#25D366]/30">
                  <MessageCircle className="w-5 h-5"/> Обработать
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   КОМПОНЕНТЫ: ДАШБОРД ВЛАДЕЛЬЦА (Аналитика)
   ========================================== */
function OwnerDashboard({ clients }) {
  const totalClients = clients.length;
  const clientsWithDates = clients.filter(c => c.clientBirthday).length;
  const healthScore = totalClients > 0 ? Math.round((clientsWithDates / totalClients) * 100) : 0;
  let healthColor = 'text-red-500'; if (healthScore > 30) healthColor = 'text-amber-500'; if (healthScore > 70) healthColor = 'text-green-500';

  // ROI: Считаем сумму покупок тех клиентов, у которых есть логи (значит с ними работали через CRM)
  const roiSum = clients.filter(c => c.logs && c.logs.length > 0).reduce((sum, c) => sum + (c.totalPrice || 0), 0);

  // Таблица эффективности (Группировка по менеджерам)
  const managers = {};
  clients.forEach(c => {
    (c.logs || []).forEach(log => {
       if (!managers[log.manager]) managers[log.manager] = { touches: 0, successful: 0 };
       managers[log.manager].touches++;
       if (log.status === 'Успешно (Продажа)') managers[log.manager].successful++;
    });
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-500 uppercase text-xs mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> Health Score базы</h3>
          <div className="flex items-end gap-3"><span className={`text-5xl font-black ${healthColor}`}>{healthScore}%</span><span className="text-slate-500 pb-1 font-medium">клиентов с датами</span></div>
          <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden"><div className={`h-full ${healthScore > 70 ? 'bg-green-500' : healthScore > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${healthScore}%`}}></div></div>
        </div>
        
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm border border-slate-800">
          <h3 className="font-bold text-slate-400 uppercase text-xs mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> ROI от касаний CRM</h3>
          <div className="flex items-end gap-3"><span className="text-5xl font-black text-green-400">{roiSum.toLocaleString('ru')} ₸</span></div>
          <p className="text-xs text-slate-400 mt-4">Сумма чеков от клиентов, обработанных менеджерами</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h3 className="font-black text-lg">Таблица эффективности сотрудников</h3></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><th className="p-4 font-bold">Менеджер</th><th className="p-4 font-bold">Факт касаний</th><th className="p-4 font-bold">Успешные сделки</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(managers).length === 0 ? (
              <tr><td colSpan="3" className="p-6 text-center text-slate-400">Нет логов действий</td></tr>
            ) : Object.entries(managers).map(([mName, data], i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{mName}</td>
                <td className="p-4 font-medium">{data.touches}</td>
                <td className="p-4 font-medium text-green-600">{data.successful}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================
   МОДАЛКА: ЛОГИРОВАНИЕ КАСАНИЯ (Сотрудник)
   ========================================== */
function TouchModal({ client, onClose, onSave }) {
  const [status, setStatus] = useState('Отправил шаблон поздравления');
  const [note, setNote] = useState('');

  const handleWA = () => {
    const txt = encodeURIComponent(`Здравствуйте! Приближается ваш праздник, хотели предложить варианты десертов...`);
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${txt}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800">Обработка клиента</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <p className="font-bold text-slate-800">{client.clientName}</p>
          <p className="text-sm text-slate-500">{client.phone}</p>
        </div>

        <button onClick={handleWA} className="w-full mb-6 bg-[#25D366]/10 text-[#1ebd5a] hover:bg-[#25D366] hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          <MessageCircle className="w-5 h-5"/> Открыть WhatsApp с шаблоном
        </button>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h4 className="font-bold text-sm uppercase text-slate-500">Зафиксировать результат:</h4>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium outline-none">
            <option value="Отправил шаблон поздравления">Отправил шаблон поздравления</option>
            <option value="Клиент запросил прайс">Клиент запросил прайс</option>
            <option value="Успешно (Продажа)">Успешно (Закрыл продажу)</option>
            <option value="Отказ / Не ответил">Отказ / Не ответил</option>
          </select>
          <textarea placeholder="Комментарий (опционально)..." value={note} onChange={e=>setNote(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium outline-none resize-none h-24"></textarea>
          <button onClick={() => onSave(status, note)} className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg">Сохранить лог</button>
        </div>
      </div>
    </div>
  );
}

// Заглушка для доски (KanbanBoard)
function KanbanBoard() {
  return <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-200">Доска Канбан (перейдите в список или дашборд)</div>;
}
