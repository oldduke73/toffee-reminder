import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Calendar, Phone, MessageCircle, ShoppingBag, 
  User, AlertCircle, Check, Copy, X, Star, Download, Upload, 
  Search, Edit3, FileSpreadsheet, Kanban, List, GripHorizontal, 
  Globe, Cloud, CloudOff, Sun, Moon 
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
    list: 'Список', board: 'Доска', calendar: 'Календарь', import: 'Импорт', export: 'Экспорт',
    addClient: 'Добавить клиента', search: 'Поиск (Номер, Имя, Торт)...', editCard: 'Редактировать карточку',
    newClient: 'Новый клиент', basicData: 'Основные данные', name: 'Имя *', phone: 'Телефон *',
    vip: 'VIP Клиент', allergies: 'Аллергии (Теги)', preferences: 'Предпочтения (Текст)',
    holidays: 'Праздники и Близкие', whoIsEvent: 'Кому праздник', relName: 'Имя близкого',
    relPhone: 'Телефон (Для сюрприза)', eventType: 'Событие', date: 'Дата *', addHoliday: '+ Добавить еще один праздник',
    currentOrder: 'Текущий заказ', prodName: 'Название товара', price: 'Цена (₸)',
    hint: 'Начните вводить или выберите из списка. Если впишете новое название, оно добавится в каталог автоматически.',
    isCustom: '🎨 Это индивидуальный заказ (сложный дизайн)', customDetails: 'Опишите детали заказа: тематика, ярусы, референсы, фигурки, надпись...',
    totalCheck: 'Итого по чеку:', saveChanges: 'СОХРАНИТЬ ИЗМЕНЕНИЯ', addClientBtn: 'ДОБАВИТЬ КЛИЕНТА В БАЗУ',
    msg: 'Сообщение', write: 'Написать', copy: 'Копировать', copied: 'Скопировано', today: 'СЕГОДНЯ!', 
    inDays: (d) => `Через ${d} дн.`, customDetailsTitle: 'Индивидуальный заказ (Детали):', receipt: 'Заказ / Чек', sum: 'Сумма:', noHistory: 'Нет истории покупок',
    relationOptions: ['Себе', 'Жене', 'Мужу', 'Сыну', 'Дочери', 'Маме', 'Папе', 'Брату', 'Сестре', 'Другу', 'Коллеге', 'Родственнику'],
    eventOptions: ['День рождения', 'Годовщина', 'Юбилей', 'Другое']
  },
  kz: {
    subtitle: 'Кондитерлерге арналған ақылды CRM', inBase: 'Базада', totalSales: 'Жалпы сома',
    list: 'Тізім', board: 'Тақта', calendar: 'Күнтізбе', import: 'Импорт', export: 'Экспорт',
    addClient: 'Клиент қосу', search: 'Іздеу (Нөмір, Аты, Торт)...', editCard: 'Карточканы өңдеу',
    newClient: 'Жаңа клиент', basicData: 'Негізгі деректер', name: 'Аты *', phone: 'Телефон *',
    vip: 'VIP Клиент', allergies: 'Аллергия (Тегтер)', preferences: 'Қалаулары (Мәтін)',
    holidays: 'Мерекелер мен Жақындары', whoIsEvent: 'Кімнің мерекесі', relName: 'Жақынының аты',
    relPhone: 'Телефоны (Сыйлық үшін)', eventType: 'Оқиға', date: 'Күні *', addHoliday: '+ Тағы бір мереке қосу',
    currentOrder: 'Ағымдағы тапсырыс', prodName: 'Тауар атауы', price: 'Бағасы (₸)',
    hint: 'Енгізуді бастаңыз немесе тізімнен таңдаңыз. Жаңа атау жазсаңыз, ол каталогқа автоматты қосылады.',
    isCustom: '🎨 Бұл жеке тапсырыс (күрделі дизайн)', customDetails: 'Тапсырыс мәліметтерін сипаттаңыз: тақырып, қабаттар, фигуралар, жазу...',
    totalCheck: 'Чек бойынша барлығы:', saveChanges: 'ӨЗГЕРІСТЕРДІ САҚТАУ', addClientBtn: 'КЛИЕНТТІ БАЗАҒА ҚОСУ',
    msg: 'Хабарлама', write: 'Жазу', copy: 'Көшіру', copied: 'Көшірілді', today: 'БҮГІН!', 
    inDays: (d) => `${d} күннен кейін`, customDetailsTitle: 'Жеке тапсырыс (Мәліметтер):', receipt: 'Тапсырыс / Чек', sum: 'Сомасы:', noHistory: 'Сатып алу тарихы жоқ',
    relationOptions: ['Өзіме', 'Әйеліме', 'Күйеуіме', 'Ұлыма', 'Қызыма', 'Анама', 'Әкеме', 'Ағама/Ініме', 'Әпкеме/Қарындасыма', 'Досыма', 'Әріптесіме', 'Туысыма'],
    eventOptions: ['Туған күн', 'Мерейтой (Годовщина)', 'Мерейтой (Юбилей)', 'Басқа']
  }
};

const initialCatalog = [
  "Молочная девочка", "Шоколадный пломбир", "Сникерс", "Нутелла", "Наполеон", "Медовик", 
  "Чизкейк испанский", "Пирог 23см", "Пирог 18см", "Трайфл", "Моти", "Эклер", "Мини испанский", 
  "Макаронс", "Круассан куриный", "Круассан семга", "Круассан нутелла", "Бенто торт", "Фрезье"
];

export default function App() {
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const t = translations[lang];

  const [clients, setClients] = useState([]);
  const [catalog, setCatalog] = useState(initialCatalog);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCake, setFilterCake] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [whatsappHelper, setWhatsappHelper] = useState({ show: false, client: null, draftText: '' });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [orderInput, setOrderInput] = useState({ name: '', price: '' });
  
  const fileInputRef = useRef(null);
  const AVAILABLE_TAGS = ['🔴 Арахис (Аллергия)', '🟡 Без глютена', '🟢 Веган', '🔵 Без сахара', '🟣 Без лактозы'];

  const initialNewClientState = { 
    clientName: '', phone: '+7 ', isLoyalClient: false, tags: [], preferences: '',
    relatives: [{ id: Date.now(), relation: 'Себе', name: '', phone: '', eventDate: '', eventType: 'День рождения' }],
    isCustomOrder: false, customOrderDetails: '', purchasedItems: [], totalPrice: 0, currentOrderStatus: 'Не связались'
  };
  const [newClient, setNewClient] = useState(initialNewClientState);

  useEffect(() => {
    let unsubscribeClients = () => {};

    const initAuthAndData = async () => {
      try {
        await signInAnonymously(auth);
        
        onAuthStateChanged(auth, (user) => {
          if (user) {
            const clientsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'clients');
            
            unsubscribeClients = onSnapshot(clientsRef, (snapshot) => {
              const loadedClients = [];
              
              snapshot.forEach(docSnap => {
                const data = docSnap.data();
                // САНИТАЙЗЕР: Жесткая защита от undefined (Пустых полей)
                loadedClients.push({
                  id: docSnap.id,
                  clientName: data.clientName || "Без имени",
                  phone: data.phone || "Нет номера",
                  clientBirthday: data.clientBirthday || "",
                  isLoyalClient: !!data.isLoyalClient,
                  tags: Array.isArray(data.tags) ? data.tags : [],
                  preferences: data.preferences || "",
                  relatives: Array.isArray(data.relatives) ? data.relatives : [],
                  isCustomOrder: !!data.isCustomOrder,
                  customOrderDetails: data.customOrderDetails || "",
                  purchasedItems: Array.isArray(data.purchasedItems) ? data.purchasedItems : [],
                  totalPrice: Number(data.totalPrice) || 0,
                  currentOrderStatus: data.currentOrderStatus || "Не связались"
                });
              });
              
              setClients(loadedClients);
              setIsDbConnected(true); // Включаем зеленый значок "Online"
            }, (error) => {
              console.error("Firebase Snapshot Error:", error);
              setIsDbConnected(false);
            });
          }
        });
      } catch (e) {
        console.error("Auth Error", e);
        setIsDbConnected(false);
      }
    };

    initAuthAndData();
    return () => unsubscribeClients();
  }, []);

  const getDaysLeft = (targetDate) => {
    if (!targetDate) return 999;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const event = new Date(targetDate); event.setHours(0, 0, 0, 0);
    return Math.ceil((event - today) / (1000 * 60 * 60 * 24));
  };

  const getFormatDate = (dateString) => {
    if (!dateString) return lang === 'ru' ? 'Нет данных' : 'Мәлімет жоқ';
    return new Date(dateString).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'kk-KZ', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getNearestEvent = (relatives) => {
    const safeRelatives = Array.isArray(relatives) ? relatives : [];
    if (safeRelatives.length === 0) return { daysLeft: 999, date: null, name: '' };
    
    let nearest = { daysLeft: 999, date: null, name: '' };
    safeRelatives.forEach(rel => {
      const days = getDaysLeft(rel.eventDate);
      if (days >= 0 && days < nearest.daysLeft) {
        nearest = { daysLeft: days, date: rel.eventDate, name: rel.relation + (rel.name ? ` (${rel.name})` : '') };
      }
    });
    
    if (nearest.daysLeft === 999) {
       const sorted = [...safeRelatives].sort((a,b) => new Date(b.eventDate) - new Date(a.eventDate));
       if (sorted[0]) nearest = { daysLeft: getDaysLeft(sorted[0].eventDate), date: sorted[0].eventDate, name: sorted[0].relation };
    }
    return nearest;
  };

  const totalSales = clients.reduce((sum, c) => sum + (c.totalPrice || 0), 0);
  
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchQuery.toLowerCase();
      const safeName = (c.clientName || "").toLowerCase();
      const safePhone = (c.phone || "").toLowerCase();
      
      const matchSearch = safeName.includes(q) || safePhone.includes(q);
      const matchFilter = filterCake === 'All' || (Array.isArray(c.purchasedItems) && c.purchasedItems.some(i => (i.name || "").toUpperCase().includes(filterCake.toUpperCase())));
      
      return matchSearch && matchFilter;
    });
  }, [clients, searchQuery, filterCake]);

  const handlePhoneChange = (e, isRelative = false, relId = null) => {
    let input = e.target.value.replace(/\D/g, ''); 
    if (input.length === 0) input = '7'; 
    if (input[0] !== '7') input = '7' + input; 
    input = input.substring(0, 11);
    
    let formatted = '+7 '; 
    if (input.length > 1) formatted += '(' + input.substring(1, 4); 
    if (input.length >= 5) formatted += ') ' + input.substring(4, 7); 
    if (input.length >= 8) formatted += '-' + input.substring(7, 9); 
    if (input.length >= 10) formatted += '-' + input.substring(9, 11);
    
    if (isRelative) updateRelative(relId, 'phone', formatted);
    else setNewClient({ ...newClient, phone: formatted });
  };

  const addRelative = () => setNewClient({ ...newClient, relatives: [...(newClient.relatives || []), { id: Date.now(), relation: 'Другу', name: '', phone: '', eventDate: '', eventType: 'День рождения' }] });
  const updateRelative = (id, field, value) => setNewClient({ ...newClient, relatives: (newClient.relatives || []).map(rel => rel.id === id ? { ...rel, [field]: value } : rel) });
  const removeRelative = (id) => setNewClient({ ...newClient, relatives: (newClient.relatives || []).filter(rel => rel.id !== id) });
  const toggleTag = (tag) => {
    const currentTags = newClient.tags || [];
    if (currentTags.includes(tag)) setNewClient({ ...newClient, tags: currentTags.filter(t => t !== tag) });
    else setNewClient({ ...newClient, tags: [...currentTags, tag] });
  };

  const addOrderItem = (e) => {
    e.preventDefault();
    if (!orderInput.name || !orderInput.price) return;
    const newItem = { uniqueId: Date.now(), name: orderInput.name.trim(), price: parseInt(orderInput.price) };
    const updatedItems = [...(newClient.purchasedItems || []), newItem];
    const updatedPrice = updatedItems.reduce((sum, item) => sum + parseInt(item.price || 0), 0);
    setNewClient({ ...newClient, purchasedItems: updatedItems, totalPrice: updatedPrice });
    
    if (!catalog.includes(newItem.name)) {
      setCatalog([...catalog, newItem.name]);
    }
    setOrderInput({ name: '', price: '' });
  };

  const removeOrderItem = (uniqueId) => {
    const updatedItems = (newClient.purchasedItems || []).filter(item => item.uniqueId !== uniqueId);
    const updatedPrice = updatedItems.reduce((sum, item) => sum + parseInt(item.price || 0), 0);
    setNewClient({ ...newClient, purchasedItems: updatedItems, totalPrice: updatedPrice });
  };

  const saveClient = async (e) => {
    e.preventDefault();
    if (!newClient.clientName || newClient.phone.length < 18) return;
    
    const clientId = editingId ? editingId.toString() : Date.now().toString();
    const clientData = { ...newClient, id: clientId };
    
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), clientData);
      setNewClient(initialNewClientState);
      setShowForm(false);
      setEditingId(null);
    } catch (error) { console.error("Save error:", error); }
  };

  const deleteClient = async (id) => {
    if(!window.confirm("Удалить карточку клиента?")) return;
    try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString())); } 
    catch (error) { console.error("Delete error", error); }
  };

  const changeOrderStatus = async (id, newStatus) => {
    try {
      const client = clients.find(c => c.id === id);
      if (client) await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()), { ...client, currentOrderStatus: newStatus });
    } catch(e) { console.error("Status error", e); }
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const delimiter = text.includes(';') ? ';' : ',';
        const lines = text.split('\n').filter(line => line.trim());
        const dataLines = lines.slice(1);
        
        for (let i = 0; i < dataLines.length; i++) {
          const line = dataLines[i];
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
          
          // Парсим товары
          const itemsStr = row[3] || "";
          const itemsArr = itemsStr.split(',').filter(i=>i.trim()).map(name => ({
            uniqueId: Date.now() + Math.random(),
            name: name.trim(),
            price: 0
          }));

          const newImportedClient = {
            id: `imp-${Date.now()}-${i}`,
            clientName: row[0] || "Без имени",
            phone: row[1] || "",
            clientBirthday: formattedDate,
            purchasedItems: itemsArr,
            relatives: formattedDate ? [{ id: Date.now(), relation: 'Себе', name: row[0] || '', phone: '', eventDate: formattedDate, eventType: 'День рождения' }] : [],
            currentOrderStatus: "Не связались",
            totalPrice: 0
          };
          
          await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', newImportedClient.id), newImportedClient);
        }
      } catch (error) { console.error('Ошибка импорта', error); }
    };
    reader.readAsText(file, 'UTF-8');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const allProductNames = Array.from(new Set([...catalog, ...clients.flatMap(c => (c.purchasedItems || []).map(i => i.name))])).sort();
  const statusMap = {
    'Не связались': lang === 'kz' ? 'Байланыс жоқ' : 'Связи нет',
    'Думает': lang === 'kz' ? 'Ойлануда' : 'Думает',
    'Внес предоплату': lang === 'kz' ? 'Алдын ала төлем' : 'Предоплата',
    'Готовится': lang === 'kz' ? 'Дайындалуда' : 'В производстве',
    'Готов/Доставлен': lang === 'kz' ? 'Дайын/Жеткізілді' : 'Завершен'
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-20 transition-colors duration-300">
        <input type="file" ref={fileInputRef} onChange={importData} accept=".csv" className="hidden" />

        <div className="bg-gradient-to-r from-rose-500 to-pink-600 dark:from-rose-900 dark:to-pink-900 rounded-b-[40px] shadow-xl p-8 pt-12 relative overflow-hidden transition-colors duration-300">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                Toffee Reminder
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <p className="text-rose-100 dark:text-rose-200 font-medium opacity-90">{t.subtitle}</p>
                 {isDbConnected ? 
                   <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-100 px-2 py-0.5 rounded-full border border-green-400/30"><Cloud className="w-3 h-3"/> Online</span> :
                   <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 animate-pulse"><CloudOff className="w-3 h-3"/> Sync...</span>
                 }
              </div>
              <div className="flex gap-4 mt-4 text-white">
                 <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center border border-white/10 shadow-sm">
                   <p className="text-[10px] text-rose-100 dark:text-rose-200 font-bold uppercase tracking-wider mb-0.5">{t.inBase}</p>
                   <p className="text-lg font-black leading-none">{clients.length}</p>
                 </div>
                 <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center border border-white/10 shadow-sm">
                   <p className="text-[10px] text-rose-100 dark:text-rose-200 font-bold uppercase tracking-wider mb-0.5">{t.totalSales}</p>
                   <p className="text-lg font-black leading-none">{totalSales.toLocaleString('ru-RU')} ₸</p>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 justify-center md:justify-end">
                <button onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm">
                  <Globe className="w-4 h-4"/> {lang === 'ru' ? 'ҚАЗ' : 'РУС'}
                </button>
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl flex items-center transition shadow-sm">
                  {theme === 'light' ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
                </button>
              </div>

              <div className="flex gap-2 items-center bg-white/10 p-1.5 rounded-2xl backdrop-blur-md justify-center shadow-sm">
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-white hover:bg-white/20'}`}><List className="w-5 h-5" /> <span className="hidden md:inline">{t.list}</span></button>
                <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'kanban' ? 'bg-white text-rose-600 shadow-sm' : 'text-white hover:bg-white/20'}`}><Kanban className="w-5 h-5" /> <span className="hidden md:inline">{t.board}</span></button>
                <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'calendar' ? 'bg-white text-rose-600 shadow-sm' : 'text-white hover:bg-white/20'}`}><Calendar className="w-5 h-5" /> <span className="hidden md:inline">{t.calendar}</span></button>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"><Upload className="w-4 h-4" /> ИМПОРТ CSV</button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-20px] relative z-20">
          
          {/* Панель поиска */}
          {!showForm && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button onClick={() => { setNewClient(initialNewClientState); setEditingId(null); setShowForm(true); }} className="md:w-1/3 bg-white dark:bg-slate-800 text-rose-500 py-4 rounded-2xl font-bold shadow-md border-b-4 border-rose-200 flex items-center justify-center gap-2 hover:bg-rose-50 transition-all">
                <Plus className="w-6 h-6" /> {t.addClient}
              </button>
              <div className="md:w-2/3 flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                  <input type="text" placeholder={t.search} className="w-full h-full min-h-[56px] pl-11 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-rose-400 outline-none shadow-sm font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="relative w-1/3">
                  <select value={filterCake} onChange={(e) => setFilterCake(e.target.value)} className="w-full h-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 outline-none font-bold text-sm text-slate-600 dark:text-slate-300">
                     <option value="All">🎂 Все десерты</option>
                     {allProductNames.map((name, i) => <option key={i} value={name}>{name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {}
          {showForm && (
            <form onSubmit={saveClient} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 mb-8 space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">{editingId ? t.editCard : t.newClient}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition"><X className="w-6 h-6"/></button>
              </div>

              {/* Поля формы (Имя, Телефон, Теги) */}
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.name}</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" value={newClient.clientName} onChange={e => setNewClient({...newClient, clientName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.phone}</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" value={newClient.phone} onChange={handlePhoneChange} maxLength={18} />
                    </div>
                 </div>
                 <div className="space-y-2 mt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase">{t.allergies}</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${newClient.tags?.includes(tag) ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border-slate-200'}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
              </div>

              <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-rose-600 mt-4 flex justify-center gap-2 transition-all shadow-lg">
                <Check className="w-6 h-6" /> {editingId ? t.saveChanges : t.addClientBtn}
              </button>
            </form>
          )}

          {}
          {viewMode === 'list' && !showForm && (
            <div className="space-y-4 mt-8">
              {filteredClients.map(client => (
                  <div key={client.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between">
                       <div>
                         <h3 className="text-xl font-black">{client.clientName}</h3>
                         <p className="text-slate-500">{client.phone}</p>
                         {client.tags && client.tags.map(t => <span key={t} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-md mr-1 mt-2 inline-block border border-red-100">{t}</span>)}
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <select value={client.currentOrderStatus || 'Не связались'} onChange={(e) => changeOrderStatus(client.id, e.target.value)} className="text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer shadow-sm">
                             {Object.entries(statusMap).map(([ruKey, displayValue]) => <option key={ruKey} value={ruKey}>{displayValue}</option>)}
                          </select>
                          <div className="flex gap-2 mt-2">
                             <button onClick={() => { setEditingId(client.id); setNewClient(client); setShowForm(true); }} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100"><Edit3 className="w-4 h-4"/></button>
                             <button onClick={() => deleteClient(client.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                          </div>
                       </div>
                    </div>
                  </div>
              ))}
            </div>
          )}

          {viewMode === 'kanban' && !showForm && (
             <div className="flex gap-4 overflow-x-auto pb-8 mt-8 min-h-[600px] items-start">
               {['Не связались', 'Думает', 'Внес предоплату', 'Готовится', 'Готов/Доставлен'].map(status => (
                <div key={status} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-[300px] shrink-0 border border-slate-200 dark:border-slate-700 p-2">
                  <div className="p-2 font-black text-sm uppercase text-center mb-2 text-slate-600 dark:text-slate-300">
                    {statusMap[status]} ({filteredClients.filter(c => (c.currentOrderStatus || 'Не связались') === status).length})
                  </div>
                  <div className="flex flex-col gap-3">
                    {filteredClients.filter(c => (c.currentOrderStatus || 'Не связались') === status).map(client => (
                        <div key={client.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold">{client.clientName}</h4>
                          <p className="text-xs text-slate-500 mt-1">{client.phone}</p>
                        </div>
                    ))}
                  </div>
                </div>
              ))}
             </div>
          )}

          {viewMode === 'calendar' && !showForm && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border">
               <h3 className="font-black text-xl mb-4 text-center">Откройте вид "Список" для работы</h3>
               <p className="text-center text-slate-500">В этой версии календарь отключен для обеспечения стабильности базы данных.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
