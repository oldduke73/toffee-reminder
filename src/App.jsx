import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Calendar, Phone, MessageCircle, ShoppingBag, 
  User, AlertCircle, Check, Copy, X, Star, Download, Upload, 
  Search, Edit3, FileSpreadsheet, Kanban, List, GripHorizontal, 
  Info, Sun, Moon, Globe, Cloud, CloudOff, LogOut, Lock, Unlock,
  CheckCircle, Clock, Activity, TrendingUp, Users
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

const translations = {
  ru: {
    subtitle: 'Умная CRM для кондитерских', inBase: 'В базе', totalSales: 'Сумма чеков',
    list: 'Список', board: 'Доска', calendar: 'Календарь', dashboard: 'Дашборд', import: 'Импорт', export: 'Экспорт',
    addClient: 'Добавить клиента', search: 'Поиск (Имя, Телефон, Торт)...', editCard: 'Редактировать карточку',
    newClient: 'Новый клиент', basicData: 'Основные данные', name: 'Имя *', phone: 'Телефон *', birthday: 'День Рождения (Клиента)',
    vip: 'VIP Клиент', allergies: 'Аллергии (Теги)', preferences: 'Предпочтения (Текст)',
    holidays: 'Праздники и Близкие', whoIsEvent: 'Кому праздник', relName: 'Имя близкого',
    relPhone: 'Телефон (Для сюрприза)', eventType: 'Событие', date: 'Дата *', addHoliday: '+ Добавить еще один праздник',
    currentOrder: 'Текущий заказ', prodName: 'Название товара', price: 'Цена (₸)',
    hint: 'Начните вводить или выберите из списка. Если впишете новое название, оно добавится в каталог автоматически.',
    isCustom: '🎨 Это индивидуальный заказ (сложный дизайн)', customDetails: 'Опишите детали заказа: тематика, ярусы, референсы...',
    totalCheck: 'Итого по чеку:', saveChanges: 'СОХРАНИТЬ ИЗМЕНЕНИЯ', addClientBtn: 'ДОБАВИТЬ КЛИЕНТА В БАЗУ',
    msg: 'Сообщение', write: 'Написать', copy: 'Копировать', copied: 'Скопировано', today: 'СЕГОДНЯ!', 
    inDays: (d) => `Через ${d} дн.`, customDetailsTitle: 'Индивидуальный заказ:',
    relationOptions: ['Себе', 'Жене', 'Мужу', 'Сыну', 'Дочери', 'Маме', 'Папе', 'Брату', 'Сестре', 'Другу', 'Коллеге'],
    eventOptions: ['День рождения', 'Годовщина', 'Юбилей', 'Другое']
  },
  kz: {
    subtitle: 'Кондитерлерге арналған ақылды CRM', inBase: 'Базада', totalSales: 'Жалпы сома',
    list: 'Тізім', board: 'Тақта', calendar: 'Күнтізбе', dashboard: 'Бақылау тақтасы', import: 'Импорт', export: 'Экспорт',
    addClient: 'Клиент қосу', search: 'Іздеу...', editCard: 'Карточканы өңдеу',
    newClient: 'Жаңа клиент', basicData: 'Негізгі деректер', name: 'Аты *', phone: 'Телефон *', birthday: 'Туған күні',
    vip: 'VIP Клиент', allergies: 'Аллергия (Тегтер)', preferences: 'Қалаулары (Мәтін)',
    holidays: 'Мерекелер мен Жақындары', whoIsEvent: 'Кімнің мерекесі', relName: 'Жақынының аты',
    relPhone: 'Телефоны (Сыйлық үшін)', eventType: 'Оқиға', date: 'Күні *', addHoliday: '+ Тағы бір мереке қосу',
    currentOrder: 'Ағымдағы тапсырыс', prodName: 'Тауар атауы', price: 'Бағасы (₸)',
    hint: 'Енгізуді бастаңыз немесе тізімнен таңдаңыз.',
    isCustom: '🎨 Бұл жеке тапсырыс', customDetails: 'Тапсырыс мәліметтерін сипаттаңыз...',
    totalCheck: 'Чек бойынша барлығы:', saveChanges: 'ӨЗГЕРІСТЕРДІ САҚТАУ', addClientBtn: 'КЛИЕНТТІ БАЗАҒА ҚОСУ',
    msg: 'Хабарлама', write: 'Жазу', copy: 'Көшіру', copied: 'Көшірілді', today: 'БҮГІН!', 
    inDays: (d) => `${d} күннен кейін`, customDetailsTitle: 'Жеке тапсырыс:',
    relationOptions: ['Өзіме', 'Әйеліме', 'Күйеуіме', 'Ұлыма', 'Қызыма', 'Анама', 'Әкеме', 'Ағама', 'Әпкеме', 'Досыма', 'Әріптесіме'],
    eventOptions: ['Туған күн', 'Мерейтой (Годовщина)', 'Мерейтой (Юбилей)', 'Басқа']
  }
};

const statusMap = {
  'Не связались': 'Связи нет',
  'Думает': 'Думает',
  'Внес предоплату': 'Предоплата',
  'Готовится': 'В производстве',
  'Готов/Доставлен': 'Завершен'
};

const initialCatalog = [
  "Молочная девочка", "Шоколадный пломбир", "Сникерс", "Нутелла", "Наполеон", "Медовик", "Чизкейк испанский", 
  "Бенто торт", "Фрезье", "Минидесерты", "Меренговый рулет", "Круассан"
];

export default function App() {
  // === СОСТОЯНИЯ АВТОРИЗАЦИИ ===
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState('logged_out'); // 'logged_out', 'owner', 'employee', 'guest'
  const [currentUserConfig, setCurrentUserConfig] = useState({ name: '', role: '' });
  const [showAccessModal, setShowAccessModal] = useState(false);

  // === ОСНОВНЫЕ СОСТОЯНИЯ ===
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const t = translations[lang];

  const [clients, setClients] = useState([]);
  const [catalog, setCatalog] = useState(initialCatalog);
  
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, list, kanban, calendar
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCake, setFilterCake] = useState('All');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // Для обработки касаний сотрудником
  const [touchModal, setTouchModal] = useState({ show: false, client: null, eventTitle: '' });
  const [calendarDate, setCalendarDate] = useState(new Date());

  const fileInputRef = useRef(null);
  const AVAILABLE_TAGS = ['🔴 Арахис', '🟡 Без глютена', '🟢 Веган', '🔵 Без сахара', '🟣 Без лактозы'];

  const initialNewClientState = { 
    clientName: '', phone: '+7 ', clientBirthday: '', isLoyalClient: false, tags: [], preferences: '',
    relatives: [], isCustomOrder: false, customOrderDetails: '', purchasedItems: [], totalPrice: 0, 
    currentOrderStatus: 'Не связались', logs: []
  };
  const [newClient, setNewClient] = useState(initialNewClientState);
  const [orderInput, setOrderInput] = useState({ name: '', price: '' });

  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const clientsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'clients');
    const unsubscribeClients = onSnapshot(clientsRef, (snapshot) => {
      const loadedClients = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        // Санитайзер (Защита от белого экрана)
        loadedClients.push({
          id: docSnap.id,
          clientName: data.clientName || "",
          phone: data.phone || "",
          clientBirthday: data.clientBirthday || "",
          isLoyalClient: !!data.isLoyalClient,
          tags: Array.isArray(data.tags) ? data.tags : [],
          preferences: data.preferences || "",
          relatives: Array.isArray(data.relatives) ? data.relatives : [],
          isCustomOrder: !!data.isCustomOrder,
          customOrderDetails: data.customOrderDetails || "",
          purchasedItems: Array.isArray(data.purchasedItems) ? data.purchasedItems : [],
          totalPrice: Number(data.totalPrice) || 0,
          currentOrderStatus: data.currentOrderStatus || "Не связались",
          manager: data.manager || "Не назначен",
          logs: Array.isArray(data.logs) ? data.logs : []
        });
      });
      setClients(loadedClients);
      setIsDbConnected(true);
    }, (error) => setIsDbConnected(false));

    return () => { unsubscribeClients(); };
  }, [user]);

  const handleProtectedAction = (actionFn) => {
    if (authState === 'guest') { setShowAccessModal(true); return; }
    actionFn();
  };

  // Рекуррентная логика поиска ближайшего события (игнорируем год)
  const getNearestEvent = (client) => {
    const today = new Date(); today.setHours(0,0,0,0);
    let nearest = { daysLeft: 999, date: null, name: '', age: null };
    
    const checkDate = (dateStr, title, birthYearStr) => {
       if (!dateStr || dateStr.length < 5) return;
       // Берем только ММ-ДД
       const mmdd = dateStr.substring(dateStr.length - 5);
       const [month, day] = mmdd.split('-');
       let eventDate = new Date(today.getFullYear(), parseInt(month)-1, parseInt(day));
       
       // Если дата уже прошла в этом году, смотрим на следующий год
       if (eventDate < today) {
           eventDate = new Date(today.getFullYear() + 1, parseInt(month)-1, parseInt(day));
       }
       
       const daysLeft = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
       
       let age = null;
       const birthYear = parseInt(birthYearStr);
       if (!isNaN(birthYear) && birthYear > 1900) {
           age = eventDate.getFullYear() - birthYear;
       }

       if (daysLeft < nearest.daysLeft) {
           nearest = { daysLeft, date: `${eventDate.getFullYear()}-${mmdd}`, name: title, age };
       }
    };

    if (client.clientBirthday) {
       checkDate(client.clientBirthday, 'Свой День Рождения', client.clientBirthday.substring(0,4));
    }
    
    (client.relatives || []).forEach(rel => {
       checkDate(rel.eventDate, `${rel.relation} ${rel.name ? `(${rel.name})` : ''}`, rel.eventDate.substring(0,4));
    });

    return nearest;
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (c.clientName?.toLowerCase().includes(q)) || (c.phone?.toLowerCase().includes(q));
      
      const matchFilter = filterCake === 'All' || 
         c.purchasedItems.some(i => i.name && i.name.toUpperCase() === filterCake.toUpperCase());
         
      return matchSearch && matchFilter;
    });
  }, [clients, searchQuery, filterCake]);

  const totalSales = clients.reduce((sum, c) => sum + (c.totalPrice || 0), 0);

  const handlePhoneChange = (e, field = 'phone', relativeId = null) => {
    let input = e.target.value.replace(/\D/g, ''); if (input.length === 0) input = '7'; if (input[0] !== '7') input = '7' + input; input = input.substring(0, 11);
    let formatted = '+7 '; if (input.length > 1) formatted += '(' + input.substring(1, 4); if (input.length >= 5) formatted += ') ' + input.substring(4, 7); if (input.length >= 8) formatted += '-' + input.substring(7, 9); if (input.length >= 10) formatted += '-' + input.substring(9, 11);
    
    if (relativeId) {
      setNewClient({ ...newClient, relatives: newClient.relatives.map(r => r.id === relativeId ? {...r, phone: formatted} : r) });
    } else {
      setNewClient({ ...newClient, [field]: formatted });
    }
  };

  const addOrderItem = () => {
    if (!orderInput.name || !orderInput.price) return;
    const newItem = { uniqueId: Date.now(), name: orderInput.name.trim(), price: parseInt(orderInput.price) || 0 };
    const updatedItems = [...(newClient.purchasedItems || []), newItem];
    setNewClient({ ...newClient, purchasedItems: updatedItems, totalPrice: updatedItems.reduce((s, i) => s + i.price, 0) });
    if (!catalog.includes(newItem.name)) setCatalog([...catalog, newItem.name]);
    setOrderInput({ name: '', price: '' });
  };

  const saveClient = async (e) => {
    e.preventDefault();
    handleProtectedAction(async () => {
      const clientId = editingId ? editingId.toString() : Date.now().toString();
      const clientData = { ...newClient, id: clientId, manager: currentUserConfig.name || "Не назначен" };
      try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), clientData);
        setNewClient(initialNewClientState); setShowForm(false); setEditingId(null);
      } catch (err) { console.error(err); }
    });
  };

  const changeOrderStatus = async (id, newStatus) => {
    handleProtectedAction(async () => {
      const client = clients.find(c => c.id === id);
      if (client) await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()), { ...client, currentOrderStatus: newStatus });
    });
  };

  const deleteClient = async (id) => {
    handleProtectedAction(async () => {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()));
    });
  };

  const logTouch = async (clientId, status, note) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const newLog = { date: new Date().toISOString(), manager: currentUserConfig.name, status, note };
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), {
        ...client, logs: [...(client.logs || []), newLog]
      });
      setTouchModal({ show: false, client: null, eventTitle: '' });
    } catch(e) { console.error(e); }
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const delimiter = text.includes(';') ? ';' : ',';
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const dataLines = lines.slice(1); // skip header
        
        for (let i = 0; i < dataLines.length; i++) {
          const row = dataLines[i].split(delimiter).map(cell => cell ? cell.trim().replace(/^"|"$/g, '') : "");
          if (!row[0] && !row[1]) continue; // Если и имя и телефон пустые - пропускаем

          // Умный парсинг даты
          let formattedDate = "";
          const dateStr = row[2];
          if (dateStr) {
            if (/^\d{1,2}\.\d{1,2}$/.test(dateStr)) {
              const [d, m] = dateStr.split('.'); formattedDate = `2026-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            } else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
               const [d, m, y] = dateStr.split('.'); formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            } else { formattedDate = dateStr; }
          }

          // Парсинг тортов
          const cakeNames = row[3] ? row[3].split(',').map(n => n.trim()) : [];
          const purchasedItems = cakeNames.map(name => ({ uniqueId: Date.now()+Math.random(), name, price: 0 }));

          const newClientData = {
            id: `imp-${Date.now()}-${i}`,
            clientName: row[0] || "",
            phone: row[1] || "",
            clientBirthday: formattedDate, // Записываем в главное поле даты рождения
            isLoyalClient: false, tags: [], preferences: "", relatives: [], isCustomOrder: false, customOrderDetails: "",
            purchasedItems: purchasedItems,
            totalPrice: 0, currentOrderStatus: "Не связались", manager: "Система", logs: []
          };
          
          await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', newClientData.id), newClientData);
        }
      } catch (error) { console.error('Ошибка импорта', error); }
    };
    reader.readAsText(file, 'UTF-8');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (authState === 'logged_out') {
    return <AuthScreen onLogin={(role, name) => { setAuthState(role); setCurrentUserConfig({role, name}); setViewMode('dashboard'); }} />;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-20 transition-colors duration-300">
        
        {/* Шапка */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 dark:from-rose-900 dark:to-pink-900 shadow-xl p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 text-white">
              <Cake className="w-10 h-10 text-rose-100" />
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Toffee CRM
                  {isDbConnected ? <Cloud className="w-4 h-4 text-green-300" title="Online"/> : <CloudOff className="w-4 h-4 text-gray-300"/>}
                </h1>
                <p className="text-xs text-rose-100 font-bold uppercase tracking-wider">{currentUserConfig.name} ({authState})</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
              <button onClick={() => setViewMode('dashboard')} className={`p-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${viewMode === 'dashboard' ? 'bg-white text-rose-600 shadow-sm' : 'text-white hover:bg-white/20'}`}><Activity className="w-5 h-5"/> <span className="hidden md:inline">{t.dashboard}</span></button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${viewMode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-white hover:bg-white/20'}`}><List className="w-5 h-5" /> <span className="hidden md:inline">{t.list}</span></button>
              <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${viewMode === 'kanban' ? 'bg-white text-rose-600 shadow-sm' : 'text-white hover:bg-white/20'}`}><Kanban className="w-5 h-5" /> <span className="hidden md:inline">{t.board}</span></button>
              <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${viewMode === 'calendar' ? 'bg-white text-rose-600 shadow-sm' : 'text-white hover:bg-white/20'}`}><Calendar className="w-5 h-5" /> <span className="hidden md:inline">{t.calendar}</span></button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition"><Sun className="w-5 h-5"/></button>
              <button onClick={() => setAuthState('logged_out')} className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-xl transition"><LogOut className="w-5 h-5"/></button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-20">
          
          {/* Панель управления (скрыта в форме) */}
          {!showForm && viewMode !== 'dashboard' && (
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <button onClick={() => handleProtectedAction(() => { setNewClient(initialNewClientState); setEditingId(null); setShowForm(true); })} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md">
                <Plus className="w-5 h-5" /> {t.addClient}
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input type="text" placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium dark:text-white" />
              </div>

              <select value={filterCake} onChange={(e) => setFilterCake(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium dark:text-white">
                <option value="All">Все десерты</option>
                {Array.from(new Set([...catalog, ...clients.flatMap(c => c.purchasedItems.map(i=>i.name))])).filter(Boolean).sort().map(cake => (
                  <option key={cake} value={cake}>{cake}</option>
                ))}
              </select>

              {authState === 'owner' && (
                <>
                  <input type="file" ref={fileInputRef} onChange={(e) => handleProtectedAction(() => importData(e))} accept=".csv" className="hidden" />
                  <button onClick={() => handleProtectedAction(() => fileInputRef.current.click())} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition"><Upload className="w-4 h-4" /> {t.import}</button>
                </>
              )}
            </div>
          )}

          {/* Рендер Видов */}
          {showForm ? (
            <ClientForm newClient={newClient} setNewClient={setNewClient} handlePhoneChange={handlePhoneChange} addOrderItem={addOrderItem} orderInput={orderInput} setOrderInput={setOrderInput} t={t} catalog={catalog} saveClient={saveClient} cancel={() => setShowForm(false)} />
          ) : (
            <>
              {viewMode === 'dashboard' && authState === 'employee' && <EmployeeDashboard clients={clients} getNearestEvent={getNearestEvent} onTouch={(client, title) => handleProtectedAction(() => setTouchModal({show: true, client, eventTitle: title}))} />}
              {viewMode === 'dashboard' && authState === 'owner' && <OwnerDashboard clients={clients} />}
              {viewMode === 'dashboard' && authState === 'guest' && <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border">Гостевой режим. Перейдите в другой раздел.</div>}
              
              {viewMode === 'kanban' && <KanbanView clients={filteredClients} statusMap={statusMap} changeOrderStatus={changeOrderStatus} getNearestEvent={getNearestEvent} onEdit={(c) => { setNewClient(c); setEditingId(c.id); setShowForm(true); }} onDelete={deleteClient} onTouch={(client, title) => handleProtectedAction(() => setTouchModal({show: true, client, eventTitle: title}))} />}
              {viewMode === 'list' && <ListView clients={filteredClients} getNearestEvent={getNearestEvent} />}
              {viewMode === 'calendar' && <CalendarView clients={filteredClients} calendarDate={calendarDate} setCalendarDate={setCalendarDate} />}
            </>
          )}

        </div>
      </div>

      {/* Модалки */}
      {touchModal.show && <TouchModal client={touchModal.client} eventTitle={touchModal.eventTitle} onClose={() => setTouchModal({show: false, client: null})} onSave={(status, note) => logTouch(touchModal.client.id, status, note)} />}
      
      {showAccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Демо-режим</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Для редактирования необходимо войти под учетной записью.</p>
            <button onClick={() => setShowAccessModal(false)} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition">Понятно</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login === 'Toffee2026' && pass === 'crm0803') onLogin('owner', 'Владелец (Админ)');
    else if (login === 'Manager' && pass === 'crm123') onLogin('employee', 'Менеджер 1');
    else setErr('Неверные данные');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4"><Cake className="w-8 h-8 text-rose-500" /></div>
          <h2 className="text-3xl font-black text-slate-800">Toffee CRM</h2>
          <p className="text-sm font-bold text-slate-400 uppercase mt-2">Enterprise Edition</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Логин (Toffee2026 или Manager)" value={login} onChange={e=>setLogin(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium" />
          <input type="password" placeholder="Пароль" value={pass} onChange={e=>setPass(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium" />
          {err && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{err}</p>}
          <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition flex justify-center items-center gap-2"><Unlock className="w-5 h-5"/> Войти в систему</button>
        </form>
        <button onClick={() => onLogin('guest', 'Гость')} className="w-full mt-4 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition hover:bg-slate-50">Демо-режим (Только просмотр)</button>
      </div>
    </div>
  );
}

function ClientForm({ newClient, setNewClient, handlePhoneChange, addOrderItem, orderInput, setOrderInput, t, catalog, saveClient, cancel }) {
  return (
    <form onSubmit={saveClient} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t.newClient}</h2>
        <button type="button" onClick={cancel} className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition"><X className="w-6 h-6"/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          {/* Решение ТЗ 1: Дата рождения в основном блоке */}
          <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <h3 className="font-bold text-lg text-rose-500 flex items-center gap-2 mb-4"><User className="w-5 h-5"/> {t.basicData}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.name}</label>
                <input required type="text" className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none dark:text-white" value={newClient.clientName} onChange={e => setNewClient({...newClient, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.phone}</label>
                <input required type="text" className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium dark:text-white" value={newClient.phone} onChange={handlePhoneChange} maxLength={18} />
              </div>
              <div>
                <label className="block text-xs font-black text-rose-600 dark:text-rose-400 mb-1 uppercase">{t.birthday}</label>
                <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-bold text-rose-700 dark:text-rose-300" value={newClient.clientBirthday} onChange={e => setNewClient({...newClient, clientBirthday: e.target.value})} />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.preferences}</label>
             <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-sm resize-none dark:text-white" rows="2" value={newClient.preferences || ''} onChange={e => setNewClient({...newClient, preferences: e.target.value})}></textarea>
          </div>
        </div>

        <div className="space-y-5">
           <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4"><ShoppingBag className="w-5 h-5"/> {t.currentOrder}</h3>
              <datalist id="products-list">{catalog.map((name, idx) => <option key={idx} value={name} />)}</datalist>
              <div className="flex gap-2 items-end mb-4">
                 <div className="flex-1">
                   <label className="block text-[10px] font-bold text-slate-500 uppercase">{t.prodName}</label>
                   <input type="text" list="products-list" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg outline-none" value={orderInput.name} onChange={e=>setOrderInput({...orderInput, name: e.target.value})} />
                 </div>
                 <div className="w-24">
                   <label className="block text-[10px] font-bold text-slate-500 uppercase">{t.price}</label>
                   <input type="number" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg outline-none" value={orderInput.price} onChange={e=>setOrderInput({...orderInput, price: e.target.value})} />
                 </div>
                 <button onClick={addOrderItem} type="button" className="p-2.5 bg-emerald-500 text-white rounded-lg"><Plus className="w-5 h-5"/></button>
              </div>
              <ul className="space-y-2 mb-4">
                 {newClient.purchasedItems.map(item => (
                   <li key={item.uniqueId} className="flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm font-medium">
                     <span>{item.name}</span><span className="font-bold">{item.price} ₸</span>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
      <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/30 flex justify-center items-center gap-2">
        <Check className="w-6 h-6" /> {t.saveChanges}
      </button>
    </form>
  );
}

function EmployeeDashboard({ clients, getNearestEvent, onTouch }) {
  const today = new Date();
  const currentMMDD = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  const upcomingEvents = [];
  clients.forEach(c => {
    // Проверка дня рождения самого клиента
    if (c.clientBirthday && c.clientBirthday.endsWith(currentMMDD)) {
      upcomingEvents.push({ client: c, type: 'День Рождения Клиента' });
    }
    // Проверка дней рождений родственников
    (c.relatives || []).forEach(rel => {
      if (rel.eventDate && rel.eventDate.endsWith(currentMMDD)) {
         upcomingEvents.push({ client: c, type: `${rel.eventType} (${rel.relation})` });
      }
    });
  });

  let touchesToday = 0;
  const todayStr = today.toISOString().substring(0,10);
  clients.forEach(c => {
     (c.logs || []).forEach(l => { if (l.date.startsWith(todayStr)) touchesToday++; });
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl"><CheckCircle className="text-green-600 w-8 h-8"/></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase">Касания (Сегодня)</p><p className="text-3xl font-black text-slate-800 dark:text-white">{touchesToday}</p></div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"><h3 className="font-black text-lg flex items-center gap-2 dark:text-white"><Clock className="text-blue-500 w-5 h-5"/> События на сегодня</h3></div>
        <div>
          {upcomingEvents.length === 0 ? (
            <p className="p-8 text-center text-slate-500 font-medium">На сегодня задач нет! Вы молодец.</p>
          ) : (
            upcomingEvents.map((ev, i) => (
              <div key={i} className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <div>
                  <h4 className="font-bold text-xl text-slate-800 dark:text-white">{ev.client.clientName || ev.client.phone}</h4>
                  <p className="text-sm text-slate-500 font-medium">{ev.type}</p>
                </div>
                <button onClick={() => onTouch(ev.client, ev.type)} className="mt-4 md:mt-0 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-[#25D366]/30">
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

function OwnerDashboard({ clients }) {
  const totalClients = clients.length;
  // Считаем Health Score (клиенты у которых есть дата рождения своя ИЛИ родственника)
  const clientsWithDates = clients.filter(c => c.clientBirthday || (c.relatives && c.relatives.length > 0)).length;
  const healthScore = totalClients > 0 ? Math.round((clientsWithDates / totalClients) * 100) : 0;
  let healthColor = 'text-red-500'; if (healthScore > 30) healthColor = 'text-amber-500'; if (healthScore > 70) healthColor = 'text-green-500';

  const roiSum = clients.filter(c => c.logs && c.logs.length > 0).reduce((sum, c) => sum + (c.totalPrice || 0), 0);
  const managers = {};
  clients.forEach(c => {
    (c.logs || []).forEach(log => {
       if (!managers[log.manager]) managers[log.manager] = { touches: 0, successful: 0, sum: 0 };
       managers[log.manager].touches++;
       if (log.status.includes('Успешно')) {
           managers[log.manager].successful++;
           managers[log.manager].sum += c.totalPrice || 0;
       }
    });
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-500 uppercase text-xs mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> Health Score базы</h3>
          <div className="flex items-end gap-3"><span className={`text-5xl font-black ${healthColor}`}>{healthScore}%</span><span className="text-slate-500 pb-1 font-medium">клиентов с датами</span></div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 mt-4 rounded-full overflow-hidden"><div className={`h-full ${healthScore > 70 ? 'bg-green-500' : healthScore > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${healthScore}%`}}></div></div>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm border border-slate-800 relative overflow-hidden">
          <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5" />
          <h3 className="font-bold text-slate-400 uppercase text-xs mb-2 relative z-10">ROI от касаний CRM</h3>
          <div className="flex items-end gap-3 relative z-10"><span className="text-5xl font-black text-green-400">{roiSum.toLocaleString('ru')} ₸</span></div>
          <p className="text-xs text-slate-400 mt-4 relative z-10">Сумма чеков от клиентов, обработанных менеджерами</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700"><h3 className="font-black text-lg dark:text-white">Таблица эффективности (Leaderboard)</h3></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase">
            <tr><th className="p-4 font-bold">Менеджер</th><th className="p-4 font-bold">Касания</th><th className="p-4 font-bold">Продажи</th><th className="p-4 font-bold">Сумма</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {Object.entries(managers).map(([mName, data], i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <td className="p-4 font-bold text-slate-800 dark:text-white">{mName}</td>
                <td className="p-4 font-medium dark:text-slate-300">{data.touches}</td>
                <td className="p-4 font-bold text-green-600 dark:text-green-400">{data.successful}</td>
                <td className="p-4 font-black text-slate-800 dark:text-white">{data.sum.toLocaleString('ru')} ₸</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView({ clients, calendarDate, setCalendarDate }) {
  const renderDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay() - 1; if (startDay === -1) startDay = 6;
    
    const blanks = Array.from({ length: startDay }).map((_, i) => <div key={`b-${i}`} className="min-h-[100px]"></div>);
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const d = i + 1;
      const currentMMDD = `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const events = [];
      // Решение ТЗ 2: Рекуррентный поиск событий по MM-DD
      clients.forEach(c => {
        if (c.clientBirthday && c.clientBirthday.endsWith(currentMMDD)) {
           const birthYear = parseInt(c.clientBirthday.substring(0, 4));
           const age = (!isNaN(birthYear) && birthYear > 1900) ? year - birthYear : null;
           events.push({ name: c.clientName || c.phone, age, type: 'ДР Клиента' });
        }
        (c.relatives || []).forEach(rel => {
          if (rel.eventDate && rel.eventDate.endsWith(currentMMDD)) {
             const birthYear = parseInt(rel.eventDate.substring(0, 4));
             const age = (!isNaN(birthYear) && birthYear > 1900) ? year - birthYear : null;
             events.push({ name: `${rel.name || 'Близкий'} (${rel.relation})`, age, type: rel.eventType });
          }
        });
      });

      return (
        <div key={d} className={`min-h-[100px] p-2 rounded-xl border flex flex-col ${events.length > 0 ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
          <span className={`text-sm font-bold ${events.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>{d}</span>
          <div className="mt-1 flex flex-col gap-1 overflow-y-auto">
            {events.map((ev, idx) => (
              <div key={idx} className="text-[10px] bg-rose-500 text-white rounded p-1.5 shadow-sm leading-tight">
                <span className="font-bold">{ev.name}</span>
                {ev.age > 0 && <span className="opacity-90 block">({ev.age} л.)</span>}
              </div>
            ))}
          </div>
        </div>
      );
    });
    return [...blanks, ...days];
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl flex items-center gap-2 dark:text-white"><Calendar className="text-rose-500" /> Ежегодные события</h3>
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold transition dark:text-white">&larr;</button>
          <span className="font-black w-36 text-center uppercase text-sm dark:text-white">{calendarDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold transition dark:text-white">&rarr;</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center font-bold text-slate-400 text-xs uppercase py-2">{d}</div>)}
        {renderDays()}
      </div>
    </div>
  );
}

function KanbanView({ clients, statusMap, changeOrderStatus, getNearestEvent, onEdit, onDelete, onTouch }) {
   return (
      <div className="flex gap-4 overflow-x-auto pb-8 min-h-[600px] animate-in fade-in">
        {Object.keys(statusMap).map(status => (
          <div key={status} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-[320px] shrink-0 border border-slate-200 dark:border-slate-700 flex flex-col" onDragOver={(e) => e.preventDefault()} onDrop={(e) => changeOrderStatus(e.dataTransfer.getData('clientId'), status)}>
            <div className="p-4 font-black text-sm uppercase rounded-t-2xl border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {statusMap[status]} <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">{clients.filter(c => c.currentOrderStatus === status).length}</span>
            </div>
            <div className="p-3 flex flex-col gap-3 flex-1">
              {clients.filter(c => c.currentOrderStatus === status).map(client => {
                const nearest = getNearestEvent(client);
                return (
                  <div key={client.id} draggable onDragStart={(e) => e.dataTransfer.setData('clientId', client.id)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md transition relative group">
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">{client.clientName || client.phone}</h4>
                    {client.clientName && <p className="text-xs font-mono text-slate-500 mb-2">{client.phone}</p>}
                    
                    {nearest.date && (
                       <div className="text-xs bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-2 rounded-lg font-bold mb-2">
                          Событие: {nearest.date.substring(5,10)} ({nearest.name})
                          {nearest.age > 0 && ` — исполняется ${nearest.age}`}
                       </div>
                    )}
                    
                    {client.purchasedItems.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2 line-clamp-2">
                         Торты: {client.purchasedItems.map(i=>i.name).join(', ')}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button onClick={() => onTouch(client, nearest.name)} className="flex-1 bg-[#25D366]/10 text-[#1ea751] hover:bg-[#25D366] hover:text-white py-1.5 rounded-lg text-xs font-bold transition">WhatsApp</button>
                        <button onClick={() => onEdit(client)} className="px-3 bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 rounded-lg transition"><Edit3 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
   );
}

function ListView({ clients, getNearestEvent }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in">
       <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase">
             <tr><th className="p-4 font-bold">Клиент</th><th className="p-4 font-bold">Ближайшее событие</th><th className="p-4 font-bold">Покупки</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
             {clients.map(c => {
                const nearest = getNearestEvent(c);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-4">
                       <div className="font-bold text-slate-800 dark:text-white">{c.clientName || 'Без имени'}</div>
                       <div className="text-xs text-slate-500">{c.phone}</div>
                    </td>
                    <td className="p-4">
                       {nearest.date ? (
                         <div><span className="font-bold text-rose-500">{nearest.date.substring(5,10)}</span> <span className="text-xs text-slate-500">({nearest.name})</span></div>
                       ) : <span className="text-xs text-slate-400">Нет данных</span>}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                       {c.purchasedItems.map(i=>i.name).join(', ')}
                    </td>
                  </tr>
                )
             })}
          </tbody>
       </table>
    </div>
  )
}

function TouchModal({ client, eventTitle, onClose, onSave }) {
  const [status, setStatus] = useState('Отправил шаблон поздравления');
  const [note, setNote] = useState('');

  const handleWA = () => {
    const txt = encodeURIComponent(`Здравствуйте, ${client.clientName}! Приближается праздник (${eventTitle}), хотели предложить варианты десертов...`);
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${txt}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Обработка клиента</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl transition"><X className="w-5 h-5 dark:text-white"/></button>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
          <p className="font-bold text-slate-800 dark:text-white">{client.clientName || 'Без имени'}</p>
          <p className="text-sm text-slate-500 font-mono">{client.phone}</p>
        </div>

        <button onClick={handleWA} className="w-full mb-6 bg-[#25D366]/10 text-[#1ebd5a] hover:bg-[#25D366] hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          <MessageCircle className="w-5 h-5"/> Открыть WhatsApp с шаблоном
        </button>

        <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-6">
          <h4 className="font-bold text-sm uppercase text-slate-500">Зафиксировать результат:</h4>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none dark:text-white">
            <option value="Отправил шаблон поздравления">Отправил шаблон поздравления</option>
            <option value="Успешно (Продажа)">Успешно (Закрыл продажу)</option>
            <option value="Отказ / Не ответил">Отказ / Не ответил</option>
          </select>
          <textarea placeholder="Комментарий (опционально)..." value={note} onChange={e=>setNote(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none resize-none h-24 dark:text-white"></textarea>
          <button onClick={() => onSave(status, note)} className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg">Сохранить лог</button>
        </div>
      </div>
    </div>
  );
}
