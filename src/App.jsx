import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, Phone, MessageCircle, ShoppingBag, User, AlertCircle, Check, Copy, X, Star, Download, Upload, Search, Edit3, FileSpreadsheet, Kanban, List, GripHorizontal, CheckSquare, Info, Sun, Moon, Globe, Cloud, CloudOff } from 'lucide-react';

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
    list: 'Список', board: 'Доска', calendar: 'Календарь', import: 'Импорт', export: 'Экспорт',
    addClient: 'Добавить клиента', search: 'Поиск по базе...', editCard: 'Редактировать карточку',
    newClient: 'Новый клиент', basicData: 'Основные данные', name: 'Имя *', phone: 'Телефон *', clientBirthday: 'ДР Клиента',
    vip: 'VIP Клиент', allergies: 'Аллергии (Теги)', preferences: 'Предпочтения (Текст)',
    holidays: 'Праздники и Близкие', whoIsEvent: 'Кому праздник', relName: 'Имя близкого',
    relPhone: 'Телефон', eventType: 'Событие', date: 'Дата *', addHoliday: '+ Добавить',
    currentOrder: 'Заказ', prodName: 'Товар', price: 'Цена (₸)',
    totalCheck: 'Итого:', saveChanges: 'СОХРАНИТЬ', addClientBtn: 'ДОБАВИТЬ',
    write: 'Написать', copy: 'Копировать', today: 'СЕГОДНЯ!', inDays: (d) => `Через ${d} дн.`,
    relationOptions: ['Себе', 'Жене', 'Мужу', 'Сыну', 'Дочери', 'Маме', 'Папе', 'Другу', 'Другое'],
    eventOptions: ['День рождения', 'Годовщина', 'Юбилей', 'Другое']
  },
  kz: {
    subtitle: 'Кондитерлерге арналған ақылды CRM', inBase: 'Базада', totalSales: 'Жалпы сома',
    list: 'Тізім', board: 'Тақта', calendar: 'Күнтізбе', import: 'Импорт', export: 'Экспорт',
    addClient: 'Клиент қосу', search: 'Базадан іздеу...', editCard: 'Карточканы өңдеу',
    newClient: 'Жаңа клиент', basicData: 'Негізгі деректер', name: 'Аты *', phone: 'Телефон *', clientBirthday: 'Клиенттің туған күні',
    vip: 'VIP Клиент', allergies: 'Аллергия (Тегтер)', preferences: 'Қалаулары (Мәтін)',
    holidays: 'Мерекелер', whoIsEvent: 'Кімнің мерекесі', relName: 'Аты',
    relPhone: 'Телефоны', eventType: 'Оқиға', date: 'Күні *', addHoliday: '+ Қосу',
    currentOrder: 'Тапсырыс', prodName: 'Тауар', price: 'Бағасы (₸)',
    totalCheck: 'Барлығы:', saveChanges: 'САҚТАУ', addClientBtn: 'ҚОСУ',
    write: 'Жазу', copy: 'Көшіру', today: 'БҮГІН!', inDays: (d) => `${d} күннен кейін`,
    relationOptions: ['Өзіме', 'Әйеліме', 'Күйеуіме', 'Ұлыма', 'Қызыма', 'Анама', 'Әкеме', 'Досыма', 'Басқа'],
    eventOptions: ['Туған күн', 'Мерейтой', 'Юбилей', 'Басқа']
  }
};

const getDaysLeft = (targetDateString) => {
  if (!targetDateString) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Разбираем YYYY-MM-DD
  const [year, month, day] = targetDateString.split('-').map(Number);
  
  // Создаем дату события в текущем году
  let nextEvent = new Date(today.getFullYear(), month - 1, day);
  
  // Если событие уже прошло в этом году, переносим на следующий
  if (nextEvent < today) {
    nextEvent.setFullYear(today.getFullYear() + 1);
  }
  
  const diff = nextEvent - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const t = translations[lang];
  
  const initialNewClientState = { 
    clientName: '', phone: '+7 ', clientBirthday: '', relatives: [], 
    purchasedItems: [], totalPrice: 0, currentOrderStatus: 'Не связались', tags: []
  };
  const [newClient, setNewClient] = useState(initialNewClientState);

  useEffect(() => {
    const initAuth = async () => await signInAnonymously(auth);
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const clientsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'clients');
    return onSnapshot(clientsRef, (snapshot) => {
      const loadedClients = [];
      snapshot.forEach(doc => loadedClients.push({ ...doc.data(), id: doc.id }));
      setClients(loadedClients);
      setIsDbConnected(true);
    }, () => setIsDbConnected(false));
  }, [user]);

  const addClient = async (e) => {
    e.preventDefault();
    const clientId = Date.now().toString();
    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), newClient);
    setNewClient(initialNewClientState);
    setShowForm(false);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black">Toffee Reminder</h1>
            <div className="flex gap-2">
               <button onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')} className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">{lang === 'ru' ? 'ҚАЗ' : 'РУС'}</button>
               <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">{theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}</button>
            </div>
          </header>

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full bg-rose-500 text-white p-4 rounded-xl font-bold mb-6">
              {t.addClient}
            </button>
          ) : (
            <form onSubmit={addClient} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
               <input type="text" placeholder={t.name} className="w-full p-3 border rounded-lg dark:bg-slate-700" value={newClient.clientName} onChange={e => setNewClient({...newClient, clientName: e.target.value})} />
               <input type="date" className="w-full p-3 border rounded-lg dark:bg-slate-700" value={newClient.clientBirthday} onChange={e => setNewClient({...newClient, clientBirthday: e.target.value})} />
               <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-lg font-bold">{t.addClientBtn}</button>
            </form>
          )}

          <div className="space-y-4">
             {clients.map(c => {
               const daysLeft = getDaysLeft(c.clientBirthday);
               return (
                 <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-lg">{c.clientName}</h2>
                    {c.clientBirthday && (
                      <p className={`text-sm font-bold ${daysLeft <= 7 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {daysLeft === 0 ? t.today : t.inDays(daysLeft)}
                      </p>
                    )}
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
