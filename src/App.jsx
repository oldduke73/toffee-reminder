import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Calendar, Phone, MessageCircle, ShoppingBag, User, 
  AlertCircle, Check, Copy, X, Star, Download, Upload, Search, 
  Edit3, FileSpreadsheet, Kanban, List, GripHorizontal, Sun, Moon, 
  Globe, Cloud, CloudOff, Lock, Unlock, LogOut, Cake, LayoutDashboard,
  TrendingUp, Target, ShieldAlert, CheckCircle2, Clock, Users, Key
} from 'lucide-react';

// === ИМПОРТЫ FIREBASE ===
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

// === ПЕРЕВОДЫ ===
const translations = {
  ru: {
    subtitle: 'Умная CRM для кондитерских', inBase: 'В базе', totalSales: 'Сумма чеков',
    list: 'Список', board: 'Доска', calendar: 'Календарь', dashboard: 'Дашборд', import: 'Импорт CSV', export: 'Экспорт',
    addClient: 'Добавить клиента', search: 'Поиск по базе...', editCard: 'Редактировать карточку',
    newClient: 'Новый клиент', basicData: 'Основные данные', name: 'Имя', phone: 'Телефон *', birthday: 'Дата рождения (Своя)',
    vip: 'VIP Клиент', allergies: 'Аллергии (Теги)', preferences: 'Предпочтения (Текст)',
    holidays: 'Праздники и Близкие', whoIsEvent: 'Кому праздник', relName: 'Имя близкого',
    relPhone: 'Телефон (Для сюрприза)', eventType: 'Событие', date: 'Дата *', addHoliday: '+ Добавить еще один праздник',
    currentOrder: 'Текущий заказ', prodName: 'Название товара', price: 'Цена (₸)',
    hint: 'Начните вводить или выберите из списка. Новое добавится автоматически.',
    isCustom: '🎨 Индивидуальный заказ', customDetails: 'Опишите детали заказа...',
    totalCheck: 'Итого по чеку:', saveChanges: 'СОХРАНИТЬ ИЗМЕНЕНИЯ', addClientBtn: 'ДОБАВИТЬ КЛИЕНТА В БАЗУ',
    msg: 'Сообщение', write: 'Написать', copy: 'Копировать', copied: 'Скопировано', today: 'СЕГОДНЯ!', inDays: (d) => `Через ${d} дн.`,
    customDetailsTitle: 'Индивидуальный заказ (Детали):', workload: 'Загруженность по дням', noHistory: 'Нет истории', receipt: 'Чек', sum: 'Сумма:',
    relationOptions: ['Себе', 'Жене', 'Мужу', 'Сыну', 'Дочери', 'Маме', 'Папе', 'Брату', 'Сестре', 'Другу', 'Другу семьи', 'Коллеге', 'Родственнику'],
    eventOptions: ['День рождения', 'Годовщина', 'Юбилей', 'Другое']
  },
  kz: {
    subtitle: 'Кондитерлерге арналған ақылды CRM', inBase: 'Базада', totalSales: 'Жалпы сома',
    list: 'Тізім', board: 'Тақта', calendar: 'Күнтізбе', dashboard: 'Бақылау тақтасы', import: 'Импорт CSV', export: 'Экспорт',
    addClient: 'Клиент қосу', search: 'Базадан іздеу...', editCard: 'Карточканы өңдеу',
    newClient: 'Жаңа клиент', basicData: 'Негізгі деректер', name: 'Аты', phone: 'Телефон *', birthday: 'Туған күні',
    vip: 'VIP Клиент', allergies: 'Аллергия (Тегтер)', preferences: 'Қалаулары (Мәтін)',
    holidays: 'Мерекелер мен Жақындары', whoIsEvent: 'Кімнің мерекесі', relName: 'Жақынының аты',
    relPhone: 'Телефоны (Сыйлық үшін)', eventType: 'Оқиға', date: 'Күні *', addHoliday: '+ Тағы бір мереке қосу',
    currentOrder: 'Ағымдағы тапсырыс', prodName: 'Тауар атауы', price: 'Бағасы (₸)',
    hint: 'Енгізуді бастаңыз немесе тізімнен таңдаңыз...',
    isCustom: '🎨 Жеке тапсырыс', customDetails: 'Тапсырыс мәліметтерін сипаттаңыз...',
    totalCheck: 'Барлығы:', saveChanges: 'ӨЗГЕРІСТЕРДІ САҚТАУ', addClientBtn: 'КЛИЕНТТІ БАЗАҒА ҚОСУ',
    msg: 'Хабарлама', write: 'Жазу', copy: 'Көшіру', copied: 'Көшірілді', today: 'БҮГІН!', inDays: (d) => `${d} күннен кейін`,
    customDetailsTitle: 'Жеке тапсырыс (Мәліметтер):', workload: 'Күндер бойынша жүктеме', noHistory: 'Тарихы жоқ', receipt: 'Чек', sum: 'Сомасы:',
    relationOptions: ['Өзіме', 'Әйеліме', 'Күйеуіме', 'Ұлыма', 'Қызыма', 'Анама', 'Әкеме', 'Ағама/Ініме', 'Әпкеме/Қарындасыма', 'Досыма', 'Отбасы досына', 'Әріптесіме', 'Туысыма'],
    eventOptions: ['Туған күн', 'Мерейтой (Годовщина)', 'Мерейтой (Юбилей)', 'Басқа']
  }
};

const initialCatalog = [
  "МОЛОЧНАЯ ДЕВОЧКА", "ШОКОЛАДНЫЙ ПЛОМБИР", "СНИКЕРС", "НУТЕЛЛА", "НАПОЛЕОН", "МЕДОВИК", "ЧИЗКЕЙК ИСПАНСКИЙ", "ПИРОГ 23СМ", "ПИРОГ 18СМ", "ТРАЙФЛ", 
  "МОТИ", "ЭКЛЕР", "МИНИ ИСПАНСКИЙ", "МАКАРОНС", "КРУАССАН КУРИНЫЙ", "КРУАССАН СЕМГА", "КРУАССАН НУТЕЛЛА", "КРУАССАН ФИСТАШКА", "КРУАССАН КЛУБНИКА", 
  "КРУАССАН ОРЕО", "КРУАССАН СЫР", "КРУАССАН КЛАССИКА", "КОРПУСНЫЙ ФИСТАШКА", "КОРПУСНЫЙ КОКОС", "КОРПУСНЫЙ МАНГО", "КОРПУСНЫЙ МАЛИНА", "КОРПУСНЫЙ ЧЕРНИКА", 
  "КОРПУСНЫЙ КРУАССАН", "БЕНТО ТОРТ", "ФРЕЗЬЕ", "МИНИДЕСЕРТЫ", "МЕРЕНГОВЫЙ РУЛЕТ"
];

const statusMap = {
  'Не связались': 'Не связались',
  'Думает': 'Думает',
  'Внес предоплату': 'Внес предоплату',
  'Готовится': 'Готовится',
  'Готов/Доставлен': 'Завершен'
};

const AVAILABLE_TAGS = ['🔴 Арахис (Аллергия)', '🟡 Без глютена', '🟢 Веган', '🔵 Без сахара', '🟣 Без лактозы'];

// ==========================================
// ОСНОВНОЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ==========================================
const App = () => {
  const [authState, setAuthState] = useState('logged_out'); // 'logged_out', 'employee', 'owner'
  const [currentUserProfile, setCurrentUserProfile] = useState(null); // Профиль того, кто вошел
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const [notification, setNotification] = useState('');
  const t = translations[lang];

  const [catalog, setCatalog] = useState(initialCatalog);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]); // Аккаунты сотрудников из БД

  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCake, setFilterCake] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'list', 'kanban', 'calendar'
  const [whatsappHelper, setWhatsappHelper] = useState({ show: false, client: null, draftText: '', eventName: '' });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [orderInput, setOrderInput] = useState({ name: '', price: '' });
  const fileInputRef = useRef(null);

  // Форма нового сотрудника
  const [newEmpLogin, setNewEmpLogin] = useState('');
  const [newEmpPass, setNewEmpPass] = useState('');
  const [newEmpName, setNewEmpName] = useState('');

  const initialNewClientState = { 
    clientName: '', phone: '+7 ', isLoyalClient: false, tags: [], preferences: '', clientBirthday: '',
    relatives: [], isCustomOrder: false, customOrderDetails: '', purchasedItems: [], totalPrice: 0, 
    currentOrderStatus: 'Не связались', lastTouchDate: null, lastTouchStatus: null
  };
  const [newClient, setNewClient] = useState(initialNewClientState);

  // Права доступа (RBAC)
  const handleProtectedAction = (actionFn, requiresOwner = false) => {
    if (requiresOwner && authState !== 'owner') {
      setShowAccessModal(true);
      return;
    }
    actionFn();
  };

  // Умный расчет рекуррентных дат (Ежегодный повтор)
  const getDaysLeft = (targetDateString) => {
    if (!targetDateString) return 999;
    
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    
    const eventOriginalDate = new Date(targetDateString);
    if (isNaN(eventOriginalDate)) return 999;

    // Создаем событие в ТЕКУЩЕМ году, используя месяц и день оригинала
    let nextEvent = new Date(today.getFullYear(), eventOriginalDate.getMonth(), eventOriginalDate.getDate());
    
    // Если дата в этом году уже прошла, переносим на следующий год
    if (nextEvent < today) {
      nextEvent.setFullYear(today.getFullYear() + 1);
    }
    
    return Math.ceil((nextEvent - today) / (1000 * 60 * 60 * 24));
  };

  // Вычисление возраста (исполняющегося)
  const calculateAge = (birthDateString, targetYear) => {
     if (!birthDateString) return null;
     const birthYear = new Date(birthDateString).getFullYear();
     if (birthYear < 1900 || birthYear > new Date().getFullYear()) return null;
     return targetYear - birthYear;
  };

  const getFormatDate = (dateString) => {
    if (!dateString) return lang === 'ru' ? 'Нет данных' : 'Мәлімет жоқ';
    return new Date(dateString).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'kk-KZ', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Поиск ближайшего события по клиенту (Свой ДР + Родственники)
  const getNearestEvent = (client) => {
    let nearest = { daysLeft: 999, originalDate: null, name: '' };
    
    // 1. Проверяем собственный ДР клиента
    if (client.clientBirthday) {
       const days = getDaysLeft(client.clientBirthday);
       if (days >= 0 && days < nearest.daysLeft) {
          nearest = { daysLeft: days, originalDate: client.clientBirthday, name: 'Свой День рождения' };
       }
    }

    // 2. Проверяем родственников
    const safeRelatives = Array.isArray(client.relatives) ? client.relatives : [];
    safeRelatives.forEach(rel => {
      if (rel?.eventDate) {
         const days = getDaysLeft(rel.eventDate);
         if (days >= 0 && days < nearest.daysLeft) {
            nearest = { daysLeft: days, originalDate: rel.eventDate, name: rel.relation + (rel.name ? ` (${rel.name})` : '') + ` - ${rel.eventType}` };
         }
      }
    });
    
    return nearest;
  };

  useEffect(() => {
    if (authState === 'logged_out') return;

    let unsubscribeClients = () => {};
    let unsubscribeCatalog = () => {};
    let unsubscribeAccounts = () => {};
    let unsubscribeAuth = () => {};

    const initFirebasePipeline = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }

        unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            // Подписка на клиентов (Санитайзер)
            const clientsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'clients');
            unsubscribeClients = onSnapshot(clientsRef, (snapshot) => {
              try {
                const loadedClients = [];
                snapshot.forEach(docSnap => {
                  try {
                    const data = docSnap.data();
                    loadedClients.push({ 
                      id: docSnap.id,
                      clientName: String(data.clientName || ""),
                      phone: String(data.phone || ""),
                      isLoyalClient: Boolean(data.isLoyalClient),
                      tags: Array.isArray(data.tags) ? data.tags : [],
                      preferences: String(data.preferences || ""),
                      relatives: Array.isArray(data.relatives) ? data.relatives : [],
                      isCustomOrder: Boolean(data.isCustomOrder),
                      customOrderDetails: String(data.customOrderDetails || ""),
                      purchasedItems: Array.isArray(data.purchasedItems) ? data.purchasedItems : [],
                      totalPrice: Number(data.totalPrice) || 0,
                      currentOrderStatus: String(data.currentOrderStatus || "Не связались"),
                      clientBirthday: String(data.clientBirthday || ""),
                      lastTouchDate: data.lastTouchDate || null,
                      lastTouchStatus: data.lastTouchStatus || null,
                      lastTouchBy: data.lastTouchBy || null // Кто сделал касание
                    });
                  } catch (itemErr) { console.error("Пропущена карточка", itemErr); }
                });
                setClients(loadedClients);
                setIsDbConnected(true); 
              } catch (snapshotErr) { setIsDbConnected(false); }
            }, (error) => setIsDbConnected(false));

            // Подписка на каталог
            const catalogRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'catalog');
            unsubscribeCatalog = onSnapshot(catalogRef, (docSnap) => {
              if (docSnap.exists() && docSnap.data().items) setCatalog(docSnap.data().items);
            });

            // Подписка на аккаунты сотрудников (только для владельца, но грузим для входа)
            const accountsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'accounts');
            unsubscribeAccounts = onSnapshot(accountsRef, (docSnap) => {
              if (docSnap.exists() && docSnap.data().users) setAccounts(docSnap.data().users);
            });

          } else {
            setIsDbConnected(false); 
          }
        });
      } catch (e) { setIsDbConnected(false); }
    };

    initFirebasePipeline();
    return () => { unsubscribeAuth(); unsubscribeClients(); unsubscribeCatalog(); unsubscribeAccounts(); };
  }, [authState]); 

  // Отдельная предзагрузка аккаунтов на экране логина (чтобы войти)
  useEffect(() => {
    if (authState === 'logged_out') {
       const fetchAccountsOnLogin = async () => {
         try {
           await signInAnonymously(auth);
           const accountsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'accounts');
           onSnapshot(accountsRef, (docSnap) => {
             if (docSnap.exists() && docSnap.data().users) setAccounts(docSnap.data().users);
           });
         } catch(e) {}
       };
       fetchAccountsOnLogin();
    }
  }, [authState]);


  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const query = String(searchQuery || "").toLowerCase();
      const nameMatch = client.clientName.toLowerCase().includes(query);
      const phoneMatch = client.phone.toLowerCase().includes(query);
      const itemsMatch = client.purchasedItems.some(item => item && item.name && String(item.name).toLowerCase().includes(query));
      const matchesSearch = nameMatch || phoneMatch || itemsMatch;
      const matchesFilter = filterCake === 'All' || client.purchasedItems.some(item => item && item.name && String(item.name).toUpperCase() === String(filterCake).toUpperCase());
      return matchesSearch && matchesFilter;
    });
  }, [clients, searchQuery, filterCake]);

  const totalSales = clients.reduce((sum, c) => sum + (c.totalPrice || 0), 0);

  const getDisplayName = (client) => {
    if (client.clientName && client.clientName.trim() !== "" && client.clientName.trim() !== "Без имени" && !client.clientName.includes("?")) return client.clientName;
    return client.phone || "Неизвестно"; 
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ''); if (input.length === 0) input = '7'; if (input[0] !== '7') input = '7' + input; input = input.substring(0, 11);
    let formatted = '+7 '; if (input.length > 1) formatted += '(' + input.substring(1, 4); if (input.length >= 5) formatted += ') ' + input.substring(4, 7); if (input.length >= 8) formatted += '-' + input.substring(7, 9); if (input.length >= 10) formatted += '-' + input.substring(9, 11);
    setNewClient({ ...newClient, phone: formatted });
  };

  const handleRelativePhoneChange = (id, e) => {
    let input = e.target.value.replace(/\D/g, ''); if (input.length === 0) input = '7'; if (input[0] !== '7') input = '7' + input; input = input.substring(0, 11);
    let formatted = '+7 '; if (input.length > 1) formatted += '(' + input.substring(1, 4); if (input.length >= 5) formatted += ') ' + input.substring(4, 7); if (input.length >= 8) formatted += '-' + input.substring(7, 9); if (input.length >= 10) formatted += '-' + input.substring(9, 11);
    updateRelative(id, 'phone', formatted);
  };

  const addRelative = () => setNewClient({ ...newClient, relatives: [...(newClient.relatives || []), { id: Date.now(), relation: 'Жене', name: '', phone: '', eventDate: '', eventType: 'День рождения' }] });
  const updateRelative = (id, field, value) => setNewClient({ ...newClient, relatives: (newClient.relatives || []).map(rel => rel.id === id ? { ...rel, [field]: value } : rel) });
  const removeRelative = (id) => setNewClient({ ...newClient, relatives: (newClient.relatives || []).filter(rel => rel.id !== id) });
  
  const toggleTag = (tag) => {
    const currentTags = newClient.tags || [];
    if (currentTags.includes(tag)) setNewClient({ ...newClient, tags: currentTags.filter(t => t !== tag) });
    else setNewClient({ ...newClient, tags: [...currentTags, tag] });
  };

  const addOrderItem = async (e) => {
    e.preventDefault();
    if (!orderInput.name || !orderInput.price) return;
    const formattedName = orderInput.name.trim();
    const newItem = { uniqueId: Date.now(), name: formattedName, price: parseInt(orderInput.price) };
    const updatedItems = [...(newClient.purchasedItems || []), newItem];
    const updatedPrice = updatedItems.reduce((sum, item) => sum + parseInt(item.price || 0), 0);
    setNewClient({ ...newClient, purchasedItems: updatedItems, totalPrice: updatedPrice });
    
    if (!catalog.includes(formattedName)) {
      const newCatalog = [...catalog, formattedName];
      setCatalog(newCatalog);
      try { await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'catalog'), { items: newCatalog }); } catch(e) {}
    }
    setOrderInput({ name: '', price: '' });
  };

  const removeOrderItem = (uniqueId) => {
    const updatedItems = (newClient.purchasedItems || []).filter(item => item.uniqueId !== uniqueId);
    const updatedPrice = updatedItems.reduce((sum, item) => sum + parseInt(item.price || 0), 0);
    setNewClient({ ...newClient, purchasedItems: updatedItems, totalPrice: updatedPrice });
  };

  const addClient = async (e) => {
    e.preventDefault();
    handleProtectedAction(async () => {
      if (newClient.phone.length < 18) {
        setNotification('Введите номер телефона полностью');
        setTimeout(() => setNotification(''), 3000);
        return;
      }
      
      const finalClientName = newClient.clientName && newClient.clientName.trim() !== '' ? newClient.clientName : 'Без имени';
      const clientId = editingId ? editingId.toString() : Date.now().toString();
      const clientData = { ...newClient, clientName: finalClientName, id: clientId };
      
      try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), clientData);
        setNewClient(initialNewClientState);
        setShowForm(false);
        setEditingId(null);
        setNotification('Успешно сохранено!');
        setTimeout(() => setNotification(''), 3000);
      } catch (error) { console.error("Ошибка сохранения:", error); }
    });
  };

  const editClientClick = (client) => {
    setNewClient({ ...client, tags: client.tags || [], relatives: client.relatives || [], purchasedItems: client.purchasedItems || [] });
    setEditingId(client.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteClient = (id) => {
    handleProtectedAction(async () => {
      try {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()));
        setNotification('Удалено!');
        setTimeout(() => setNotification(''), 3000);
      } catch (error) {}
    }, true); // Только Owner
  };
  
  const changeOrderStatus = (id, newStatus) => {
    handleProtectedAction(async () => {
      try {
        const clientToUpdate = clients.find(c => c.id === id);
        if (clientToUpdate) {
          await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()), { ...clientToUpdate, currentOrderStatus: newStatus });
        }
      } catch(e) {}
    });
  };

  const openWhatsAppHelper = (client) => {
    const nearest = getNearestEvent(client);
    let timeText = nearest.daysLeft === 0 ? "уже сегодня" : nearest.daysLeft === 1 ? "завтра" : `через ${nearest.daysLeft} дн.`;
    let itemsText = (client.purchasedItems && client.purchasedItems.length > 0) ? `В прошлом году вы брали у нас ${client.purchasedItems[0].name.toLowerCase()}.` : "";
    const clientDisplay = getDisplayName(client);
    const draftText = `Здравствуйте${clientDisplay !== 'Неизвестно' ? ', ' + clientDisplay : ''}! \nПишу вам, чтобы помочь с подготовкой: ${timeText} у вас праздник (${nearest.name}). \n${itemsText} \nСделать для вас подборку начинок и свободных окошек на эту дату?`;
    setWhatsappHelper({ show: true, client, draftText, eventName: nearest.name });
  };
  
  const sendToWhatsApp = async (statusLog = 'Написал в WA') => {
    window.open(`https://wa.me/${whatsappHelper.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappHelper.draftText)}`, '_blank');
    
    // Логирование касания
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', whatsappHelper.client.id.toString()), { 
         ...whatsappHelper.client, 
         lastTouchDate: new Date().toISOString(),
         lastTouchStatus: statusLog,
         lastTouchBy: currentUserProfile ? currentUserProfile.name : 'Система'
      });
      setNotification('Касание зафиксировано!');
      setTimeout(() => setNotification(''), 3000);
    } catch(e) { console.error("Ошибка логирования касания", e)}
    
    setWhatsappHelper({ show: false, client: null, draftText: '', eventName: '' });
  };

  const copyToClipboard = (client) => {
    const itemsList = (client.purchasedItems || []).map(i => `- ${i?.name} (${i?.price} ₸)`).join('\n');
    const tagsStr = client.tags && client.tags.length > 0 ? `\n⚠️ Особенности: ${client.tags.join(', ')}` : '';
    const prefStr = client.preferences ? `\n📝 Предпочтения: ${client.preferences}` : '';
    const textToCopy = `👤 Имя: ${getDisplayName(client)} ${client.isLoyalClient ? '⭐ (VIP)' : ''}\n📱 Телефон: ${client.phone}\n🎂 ДР: ${getFormatDate(client.clientBirthday)}\n${tagsStr}${prefStr}\n\n🛒 Заказ:\n${itemsList || '- Пусто -'}`.trim();
    try {
        const textArea = document.createElement("textarea"); textArea.value = textToCopy; document.body.appendChild(textArea); textArea.focus(); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea);
        setCopiedId(client.id); setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
  };

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear(); const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay() - 1;
    if (startDay === -1) startDay = 6;
    const blanks = Array.from({ length: startDay }).map((_, i) => <div key={`blank-${i}`} className="min-h-[80px]"></div>);
    
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const d = i + 1;
      const eventsOnThisDay = [];
      
      filteredClients.forEach(c => {
        // 1. Проверяем ДР самого клиента (совпадение по дню и месяцу)
        if (c.clientBirthday) {
           const bDate = new Date(c.clientBirthday);
           if (bDate.getDate() === d && bDate.getMonth() === month) {
             const age = calculateAge(c.clientBirthday, year);
             eventsOnThisDay.push({ client: c, rel: { relation: 'Себе', age, name: c.clientName }});
           }
        }
        // 2. Проверяем праздники родственников (совпадение по дню и месяцу)
        (c.relatives || []).forEach(rel => { 
          if (rel?.eventDate) {
             const relDate = new Date(rel.eventDate);
             if (relDate.getDate() === d && relDate.getMonth() === month) {
               const age = calculateAge(rel.eventDate, year);
               eventsOnThisDay.push({ client: c, rel: { relation: rel.relation, age, name: rel.name }}); 
             }
          }
        });
      });
      
      return (
        <div key={d} className={`min-h-[80px] p-2 rounded-xl border flex flex-col ${eventsOnThisDay.length > 0 ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
          <span className={`text-sm font-bold ${eventsOnThisDay.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>{d}</span>
          <div className="mt-1 flex flex-col gap-1">
            {eventsOnThisDay.map((e, idx) => {
              const displayTitle = getDisplayName(e.client);
              const ageText = e.rel.age ? ` (${e.rel.age})` : '';
              return (
                <div key={idx} onClick={() => editClientClick(e.client)} className="text-[10px] font-bold text-white bg-rose-500 rounded px-1.5 py-1 truncate cursor-pointer hover:bg-rose-600 shadow-sm leading-tight" title={`${displayTitle} - ${e.rel.relation} ${e.rel.name || ''} ${ageText}`}>
                  {displayTitle} <br/>
                  <span className="font-normal opacity-90">{e.rel.relation}{ageText}</span>
                </div>
              )
            })}
          </div>
        </div>
      );
    });
    return [...blanks, ...days];
  };

  const allProductNames = Array.from(new Set([...catalog, ...clients.flatMap(c => (c.purchasedItems || []).map(i => i && i.name ? i.name : null).filter(Boolean))])).sort();

  // === ДАШБОРДЫ И УПРАВЛЕНИЕ ДОСТУПОМ ===
  const handleAddEmployee = async (e) => {
     e.preventDefault();
     if (!newEmpLogin || !newEmpPass || !newEmpName) return;
     const newAcc = { id: Date.now(), login: newEmpLogin, password: newEmpPass, name: newEmpName, role: 'employee' };
     const updatedAccounts = [...accounts, newAcc];
     
     try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'accounts'), { users: updatedAccounts });
        setNewEmpLogin(''); setNewEmpPass(''); setNewEmpName('');
        setNotification('Сотрудник добавлен!');
        setTimeout(() => setNotification(''), 3000);
     } catch(e) { console.error(e) }
  };

  const handleDeleteEmployee = async (id) => {
     const updatedAccounts = accounts.filter(a => a.id !== id);
     try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'accounts'), { users: updatedAccounts });
        setNotification('Удалено');
        setTimeout(() => setNotification(''), 3000);
     } catch(e) {}
  };

  const renderDashboard = () => {
    // Общие метрики
    const totalClients = clients.length;
    const clientsWithDates = clients.filter(c => c.clientBirthday || (c.relatives && c.relatives.length > 0)).length;
    const healthScore = totalClients > 0 ? Math.round((clientsWithDates / totalClients) * 100) : 0;
    
    // События на ближайшие 7 дней (Для To-Do)
    const upcomingEvents = clients.map(c => {
       const nearest = getNearestEvent(c);
       return { ...c, nearest };
    }).filter(c => c.nearest.daysLeft >= 0 && c.nearest.daysLeft <= 7).sort((a,b) => a.nearest.daysLeft - b.nearest.daysLeft);

    const blindSpots = clients.filter(c => !c.clientBirthday && (!c.relatives || c.relatives.length === 0));
    
    // Метрика касаний
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const touchesThisMonth = clients.filter(c => {
       if(!c.lastTouchDate) return false;
       const d = new Date(c.lastTouchDate);
       return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return (
      <div className="space-y-6 mt-8 animate-in fade-in">
        {/* === БЛОК СОТРУДНИКА === */}
        {authState === 'employee' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Левая колонка: TO-DO ЛИСТ */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                    <Clock className="w-6 h-6 text-rose-500" /> События на ближайшие 7 дней
                  </h3>
                  
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-medium">Нет ближайших событий. Вы великолепны! ☕</div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map(client => (
                        <div key={client.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                           <div>
                             <h4 className="font-bold text-slate-800 dark:text-white text-lg">{getDisplayName(client)}</h4>
                             <p className="text-sm font-medium text-slate-500">
                               <span className={client.nearest.daysLeft === 0 ? 'text-red-500 font-bold' : client.nearest.daysLeft <= 3 ? 'text-orange-500 font-bold' : ''}>
                                 {client.nearest.daysLeft === 0 ? 'СЕГОДНЯ!' : `Через ${client.nearest.daysLeft} дн.`}
                               </span> — {client.nearest.name}
                             </p>
                             {client.lastTouchDate && (
                               <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Последний контакт: {new Date(client.lastTouchDate).toLocaleDateString()} ({client.lastTouchStatus})</p>
                             )}
                           </div>
                           <button onClick={() => openWhatsAppHelper(client)} className="mt-3 md:mt-0 px-6 py-3 bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all">
                             <MessageCircle className="w-5 h-5" /> Обработать
                           </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            {/* Правая колонка: МЕТРИКИ СОТРУДНИКА */}
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-md text-white">
                  <h4 className="text-emerald-100 font-bold uppercase text-xs mb-1">Ваши касания за месяц</h4>
                  <div className="text-5xl font-black mb-2">{touchesThisMonth}</div>
                  <p className="text-sm font-medium opacity-90">Клиентов обработано</p>
               </div>
               
               <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4"><ShieldAlert className="w-5 h-5 text-orange-500"/> Слепая зона</h4>
                  <p className="text-xs text-slate-500 mb-4">Клиенты без дат рождений (Топ 5)</p>
                  <div className="space-y-2">
                     {blindSpots.slice(0, 5).map(c => (
                        <div key={c.id} className="flex justify-between items-center text-sm p-2 bg-orange-50 dark:bg-orange-900/10 text-orange-800 dark:text-orange-400 rounded-lg">
                          <span className="font-medium truncate">{getDisplayName(c)}</span>
                          <button onClick={() => editClientClick(c)} className="text-xs underline font-bold">Заполнить</button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* === БЛОК ВЛАДЕЛЬЦА === */}
        {authState === 'owner' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-500"><TrendingUp className="w-8 h-8"/></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Общая выручка</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{totalSales.toLocaleString('ru-RU')} ₸</h3>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-500"><Users className="w-8 h-8"/></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Всего клиентов</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{totalClients}</h3>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 opacity-80"></div>
                  <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-500"><Target className="w-8 h-8"/></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Health Score Базы</p>
                    <h3 className={`text-2xl font-black ${healthScore < 30 ? 'text-red-500' : healthScore < 70 ? 'text-yellow-500' : 'text-emerald-500'}`}>{healthScore}%</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Профилей с датами</p>
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Таблица Аудита */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                   <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Журнал касаний (Аудит)</h3>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                       <thead className="text-xs text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                         <tr>
                           <th className="px-4 py-3 rounded-tl-xl">Менеджер</th>
                           <th className="px-4 py-3">Клиент</th>
                           <th className="px-4 py-3">Дата</th>
                           <th className="px-4 py-3 rounded-tr-xl">Статус</th>
                         </tr>
                       </thead>
                       <tbody>
                         {clients.filter(c => c.lastTouchDate).sort((a,b) => new Date(b.lastTouchDate) - new Date(a.lastTouchDate)).slice(0, 10).map(c => (
                           <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                             <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{c.lastTouchBy || 'Система'}</td>
                             <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-400">{getDisplayName(c)}</td>
                             <td className="px-4 py-3 text-xs">{new Date(c.lastTouchDate).toLocaleDateString('ru-RU')}</td>
                             <td className="px-4 py-3 text-emerald-600 font-bold">{c.lastTouchStatus || 'Отправлено'}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>

                {/* Управление сотрудниками */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-500" /> Управление доступами</h3>
                    
                    <form onSubmit={handleAddEmployee} className="flex gap-2 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <input required type="text" placeholder="Имя (напр. Анна)" className="w-1/3 p-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none dark:text-white" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} />
                       <input required type="text" placeholder="Логин" className="w-1/3 p-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none dark:text-white" value={newEmpLogin} onChange={e => setNewEmpLogin(e.target.value)} />
                       <input required type="text" placeholder="Пароль" className="w-1/3 p-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none dark:text-white" value={newEmpPass} onChange={e => setNewEmpPass(e.target.value)} />
                       <button type="submit" className="bg-indigo-500 text-white p-2 rounded-xl hover:bg-indigo-600 font-bold px-4">+</button>
                    </form>

                    <div className="space-y-2">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-2">Активные аккаунты ({accounts.length})</p>
                       {accounts.map(acc => (
                          <div key={acc.id} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-sm">
                             <div>
                               <p className="font-bold text-slate-800 dark:text-white text-sm">{acc.name} <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full ml-2">Сотрудник</span></p>
                               <p className="text-xs font-mono text-slate-500 mt-1">Логин: {acc.login} | Пароль: {acc.password}</p>
                             </div>
                             <button onClick={() => handleDeleteEmployee(acc.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                          </div>
                       ))}
                       {accounts.length === 0 && <p className="text-sm text-slate-500 italic">Нет созданных аккаунтов. Создайте первый аккаунт для сотрудника выше.</p>}
                    </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };


  if (authState === 'logged_out') {
    const handleLogin = (e) => {
      e.preventDefault();
      // 1. Проверяем Мастер-ключ Владельца (Невидимый)
      if (loginInput === 'Toffee2026' && passInput === 'crm0803') {
        setCurrentUserProfile({ name: 'Владелец' });
        setAuthState('owner'); setAuthError(''); return;
      }
      
      // 2. Проверяем динамические аккаунты из базы
      const foundUser = accounts.find(a => a.login === loginInput && a.password === passInput);
      if (foundUser) {
         setCurrentUserProfile(foundUser);
         setAuthState(foundUser.role || 'employee');
         setAuthError('');
      } else {
         setAuthError('Неверный логин или пароль');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
              <Cake className="w-8 h-8 text-rose-500 transform -rotate-3" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Toffee CRM</h2>
            <p className="text-slate-500 mt-2 font-medium">Для входа используйте свои учетные данные</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Логин</label>
              <input type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none transition bg-slate-50 focus:bg-white font-medium" placeholder="Введите логин" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Пароль</label>
              <input type="password" value={passInput} onChange={(e) => setPassInput(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none transition bg-slate-50 focus:bg-white font-medium" placeholder="••••••••" />
            </div>
            
            {authError && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{authError}</p>}

            <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl transition flex justify-center items-center gap-2 shadow-lg shadow-rose-500/30">
              <Unlock className="w-5 h-5" /> Войти в систему
            </button>
          </form>
        </div>
      </div>
    );
  }

  // === ОСНОВНОЙ РЕНДЕР ===
  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-20 transition-colors duration-300">
        <input type="file" ref={fileInputRef} onChange={() => {}} accept=".csv" className="hidden" /> {/* Импорт отключен в MVP для безопасности */}

        {notification && (
            <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 font-bold border border-emerald-400">
              <Check className="w-6 h-6" /> {notification}
            </div>
        )}

        <div className="bg-gradient-to-r from-rose-500 to-pink-600 dark:from-rose-900 dark:to-pink-900 rounded-b-[40px] shadow-xl p-8 pt-12 relative overflow-hidden transition-colors duration-300">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                Toffee Reminder
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <p className="text-rose-100 dark:text-rose-200 font-medium opacity-90">{t.subtitle}</p>
                 <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${authState === 'owner' ? 'bg-purple-500/30 text-purple-100 border-purple-400/30' : 'bg-blue-500/30 text-blue-100 border-blue-400/30'}`}>
                   <Lock className="w-3 h-3"/> 
                   Роль: {currentUserProfile?.name || 'Пользователь'}
                 </span>
                 {isDbConnected ? 
                   <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-100 px-2 py-0.5 rounded-full border border-green-400/30"><Cloud className="w-3 h-3"/> Online</span> :
                   <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 animate-pulse"><CloudOff className="w-3 h-3"/> Sync...</span>
                 }
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
                <button onClick={() => setAuthState('logged_out')} className="bg-white/20 hover:bg-red-500/80 text-white p-2 rounded-xl flex items-center transition shadow-sm" title="Выйти">
                  <LogOut className="w-5 h-5"/>
                </button>
              </div>

              <div className="flex gap-2 items-center bg-white/10 p-1.5 rounded-2xl backdrop-blur-md justify-center shadow-sm">
                <button onClick={() => setViewMode('dashboard')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'dashboard' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`} title="Дашборд"><LayoutDashboard className="w-5 h-5" /> <span className="hidden md:inline">{t.dashboard}</span></button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'list' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`} title="Список"><List className="w-5 h-5" /> <span className="hidden lg:inline">{t.list}</span></button>
                <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'kanban' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`} title="Доска"><Kanban className="w-5 h-5" /> <span className="hidden lg:inline">{t.board}</span></button>
                <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'calendar' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`} title="Календарь"><Calendar className="w-5 h-5" /> <span className="hidden lg:inline">{t.calendar}</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-20px] relative z-20">
          {!showForm && viewMode !== 'dashboard' && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button onClick={() => { setNewClient(initialNewClientState); setEditingId(null); setShowForm(true); }} className="md:w-1/4 shrink-0 bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 py-4 rounded-2xl font-bold shadow-md border-b-4 border-rose-200 dark:border-rose-900 flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all">
                <Plus className="w-6 h-6" /> {t.addClient}
              </button>
              
              <div className="flex-1 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                  <input type="text" placeholder="Поиск (Номер, Имя, Торт)..." className="w-full h-full min-h-[56px] pl-11 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-rose-400 dark:focus:border-rose-500 outline-none shadow-sm text-slate-700 dark:text-slate-200 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="relative md:w-64">
                   <select value={filterCake} onChange={(e) => setFilterCake(e.target.value)} className="w-full h-full min-h-[56px] px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-rose-400 outline-none shadow-sm text-slate-700 dark:text-slate-200 font-bold appearance-none cursor-pointer">
                     <option value="All">🎂 Все десерты</option>
                     {allProductNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
                   </select>
                </div>
              </div>
            </div>
          )}

          {/* === ФОРМА === */}
          {showForm && (
            <form onSubmit={addClient} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 mb-8 space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">{editingId ? t.editCard : t.newClient}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:bg-slate-700 rounded-xl transition"><X className="w-6 h-6"/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Левая колонка */}
                <div className="space-y-5">
                  <h3 className="font-bold text-lg text-rose-500 flex items-center gap-2"><User className="w-5 h-5"/> {t.basicData}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.name}</label>
                      <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none dark:text-white" value={newClient.clientName} onChange={e => setNewClient({...newClient, clientName: e.target.value})} placeholder="Опционально" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.phone}</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium dark:text-white" value={newClient.phone} onChange={handlePhoneChange} maxLength={18} />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-2xl">
                     <label className="block text-xs font-bold text-sky-800 dark:text-sky-400 mb-2 uppercase flex items-center gap-1"><Cake className="w-4 h-4"/> {t.birthday}</label>
                     <input type="date" className="w-full p-3 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700/50 rounded-xl outline-none text-sm font-bold text-sky-900 dark:text-sky-300 focus:ring-2 focus:ring-sky-400" value={newClient.clientBirthday || ''} onChange={e => setNewClient({...newClient, clientBirthday: e.target.value})} />
                     <p className="text-[10px] text-sky-600/70 dark:text-sky-400/50 mt-1">* Ежегодное напоминание сгенерируется автоматически</p>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-rose-500 rounded focus:ring-rose-400" checked={newClient.isLoyalClient} onChange={(e) => setNewClient({...newClient, isLoyalClient: e.target.checked})} />
                      <span className="font-bold text-amber-800 dark:text-amber-500 flex items-center gap-1"><Star className="w-4 h-4 fill-amber-500 text-amber-500"/> {t.vip}</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.allergies}</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${newClient.tags?.includes(tag) ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.preferences}</label>
                    <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-sm resize-none dark:text-white" rows="2" value={newClient.preferences || ''} onChange={e => setNewClient({...newClient, preferences: e.target.value})}></textarea>
                  </div>
                </div>

                {/* Правая колонка (Праздники) */}
                <div className="space-y-5">
                  <h3 className="font-bold text-lg text-pink-600 dark:text-pink-400 flex items-center gap-2"><Calendar className="w-5 h-5"/> {t.holidays}</h3>
                  {(newClient.relatives || []).map((relative, index) => (
                    <div key={relative.id} className="p-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30 rounded-2xl relative shadow-sm">
                      <button type="button" onClick={() => removeRelative(relative.id)} className="absolute top-2 right-2 text-pink-300 hover:text-red-500"><X className="w-5 h-5" /></button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.whoIsEvent}</label>
                          <select className="w-full p-2.5 bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-900/50 rounded-lg outline-none text-sm font-medium focus:ring-2 focus:ring-pink-400 dark:text-white" value={relative.relation} onChange={e => updateRelative(relative.id, 'relation', e.target.value)}>
                            {t.relationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.relName}</label>
                          <input type="text" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-900/50 rounded-lg outline-none text-sm focus:ring-2 focus:ring-pink-400 dark:text-white" value={relative.name} onChange={e => updateRelative(relative.id, 'name', e.target.value)} />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.relPhone}</label>
                        <input type="text" placeholder="+7 (777) 000-00-00" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-900/50 rounded-lg outline-none text-sm focus:ring-2 focus:ring-pink-400 font-medium dark:text-white" value={relative.phone || ''} onChange={e => handleRelativePhoneChange(relative.id, e)} maxLength={18} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.eventType}</label>
                          <select className="w-full p-2.5 bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-900/50 rounded-lg outline-none text-sm focus:ring-2 focus:ring-pink-400 dark:text-white" value={relative.eventType} onChange={e => updateRelative(relative.id, 'eventType', e.target.value)}>
                            {t.eventOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase text-pink-600 dark:text-pink-400">{t.date}</label>
                          <input required type="date" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-900/50 rounded-lg outline-none text-sm font-bold text-pink-700 dark:text-pink-400 focus:ring-2 focus:ring-pink-400" value={relative.eventDate} onChange={e => updateRelative(relative.id, 'eventDate', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addRelative} className="w-full py-3 border-2 border-dashed border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 font-bold rounded-xl hover:bg-pink-50 dark:hover:bg-slate-700 transition text-sm">{t.addHoliday}</button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4"><ShoppingBag className="w-5 h-5"/> {t.currentOrder}</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <datalist id="products-list">{allProductNames.map((name, idx) => <option key={idx} value={name} />)}</datalist>
                  <div className="mb-4">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.prodName}</label>
                        <input type="text" list="products-list" className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-400 dark:text-white" value={orderInput.name} onChange={e => setOrderInput({...orderInput, name: e.target.value})} />
                      </div>
                      <div className="w-1/3 md:w-1/4">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.price}</label>
                        <input type="number" className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-400 font-bold dark:text-white" value={orderInput.price} onChange={e => setOrderInput({...orderInput, price: e.target.value})} />
                      </div>
                      <button onClick={addOrderItem} type="button" className="p-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition flex shrink-0 items-center justify-center"><Plus className="w-5 h-5"/></button>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 ml-1 leading-tight">{t.hint}</p>
                  </div>
                  <div className="mb-6 bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 transition-all">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-rose-500 rounded focus:ring-rose-400" checked={newClient.isCustomOrder} onChange={(e) => setNewClient({...newClient, isCustomOrder: e.target.checked})} />
                      <span className="font-bold text-rose-800 dark:text-rose-400">{t.isCustom}</span>
                    </label>
                    {newClient.isCustomOrder && (
                      <textarea className="w-full mt-3 p-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-sm resize-none dark:text-white" placeholder={t.customDetails} rows="3" value={newClient.customOrderDetails || ''} onChange={e => setNewClient({...newClient, customOrderDetails: e.target.value})}></textarea>
                    )}
                  </div>
                  {(newClient.purchasedItems || []).length > 0 && (
                    <div>
                      <ul className="space-y-2 mb-4">
                        {newClient.purchasedItems.map((item) => (
                          <li key={item.uniqueId} className="flex justify-between items-center bg-white dark:bg-slate-800 px-4 py-2.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-800 dark:text-white">{item.price} ₸</span>
                              <button type="button" onClick={() => removeOrderItem(item.uniqueId)} className="text-slate-300 hover:text-red-500"><X className="w-5 h-5"/></button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between items-center bg-emerald-100 dark:bg-emerald-900/30 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400 uppercase text-sm">{t.totalCheck}</span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{newClient.totalPrice} ₸</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-rose-600 mt-4 flex justify-center gap-2 transition-all shadow-lg hover:shadow-rose-500/30">
                <Check className="w-6 h-6" /> {editingId ? t.saveChanges : t.addClientBtn}
              </button>
            </form>
          )}

          {viewMode === 'dashboard' && renderDashboard()}

          {/* ВИД: СПИСОК */}
          {viewMode === 'list' && !showForm && (
            <div className="space-y-4 mt-8">
              {filteredClients.map(client => {
                const nearestEvent = getNearestEvent(client);
                const isUrgent = nearestEvent.daysLeft >= 0 && nearestEvent.daysLeft <= 5;
                const clientDisplayName = getDisplayName(client);

                return (
                  <div key={client.id} className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border-2 transition-all ${isUrgent ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-700'}`}>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                              {clientDisplayName} {client.isLoyalClient && <Star className="w-5 h-5 fill-amber-400 text-amber-400"/>}
                            </h3>
                            {client.clientName && client.clientName !== "Без имени" && (
                              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{client.phone}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            {nearestEvent.daysLeft !== 999 && (
                              <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold mb-2 shadow-sm text-sm
                                ${nearestEvent.daysLeft === 0 ? 'bg-red-500 text-white animate-pulse' : 
                                  nearestEvent.daysLeft <= 3 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                                  nearestEvent.daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 
                                  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                {nearestEvent.daysLeft <= 5 && <AlertCircle className="w-4 h-4" />}
                                {nearestEvent.daysLeft === 0 ? t.today : t.inDays(nearestEvent.daysLeft)}
                              </div>
                            )}
                            <select value={client.currentOrderStatus || 'Не связались'} onChange={(e) => changeOrderStatus(client.id, e.target.value)} className="text-xs font-bold px-3 py-1.5 rounded-lg border dark:border-slate-600 outline-none cursor-pointer shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              {Object.entries(statusMap).map(([ruKey, displayValue]) => <option key={ruKey} value={ruKey}>{displayValue}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t.holidays}</h4>
                          {client.clientBirthday && (
                             <div className="bg-sky-50 dark:bg-sky-900/20 text-sky-900 dark:text-sky-300 p-3 rounded-xl border border-sky-100 dark:border-sky-900/30 flex justify-between items-center mb-2">
                               <div>
                                  <span className="font-bold text-sm">День рождения (Свой)</span>
                                  <p className="text-xs mt-0.5"><b>{getFormatDate(client.clientBirthday)}</b></p>
                               </div>
                               <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded text-sky-600 dark:text-sky-400 shadow-sm">{getDaysLeft(client.clientBirthday)} дн.</span>
                             </div>
                          )}
                          {(client.relatives || []).map(rel => (
                            <div key={rel.id} className="bg-pink-50 dark:bg-pink-900/20 text-pink-900 dark:text-pink-300 p-3 rounded-xl border border-pink-100 dark:border-pink-900/30 flex justify-between items-center">
                              <div>
                                 <span className="font-bold text-sm">{rel.relation} {rel.name ? `(${rel.name})` : ''}</span>
                                 {rel.phone && <p className="text-[10px] font-mono mt-0.5 text-pink-600 dark:text-pink-400 font-bold">{rel.phone}</p>}
                                 <p className="text-xs mt-0.5">{rel.eventType} — <b>{getFormatDate(rel.eventDate)}</b></p>
                              </div>
                              <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded text-pink-600 dark:text-pink-400 shadow-sm">{getDaysLeft(rel.eventDate)} дн.</span>
                            </div>
                          ))}
                        </div>

                        {client.isCustomOrder && (
                          <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 p-3 rounded-xl">
                            <p className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase mb-1 flex items-center gap-1"><Star className="w-3 h-3"/> {t.customDetailsTitle}</p>
                            <p className="text-sm text-rose-900 dark:text-rose-200 font-medium whitespace-pre-wrap">{client.customOrderDetails}</p>
                          </div>
                        )}
                      </div>

                      <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">{t.receipt}</p>
                        {(client.purchasedItems || []).length > 0 ? (
                          <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300 font-medium mb-3">
                            {client.purchasedItems.map(item => <li key={item.uniqueId}>• {item.name || 'Товар'} ({item.price || 0} ₸)</li>)}
                          </ul>
                        ) : <p className="text-sm text-slate-400 dark:text-slate-500 mb-3 italic">{t.noHistory}</p>}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t.sum}</span>
                          <span className="font-black text-slate-800 dark:text-white text-lg">{client.totalPrice || 0} ₸</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                      <button onClick={() => openWhatsAppHelper(client)} className="flex-1 bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#1ea751] dark:text-[#25D366] hover:bg-[#25D366] hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"><MessageCircle className="w-5 h-5" /> {t.write}</button>
                      <button onClick={() => copyToClipboard(client)} className="px-4 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all flex justify-center items-center gap-2 font-medium text-sm">
                        {copiedId === client.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden md:inline">{copiedId === client.id ? t.copied : t.copy}</span>
                      </button>
                      <button onClick={() => editClientClick(client)} className="px-4 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-800/50 transition-all flex items-center"><Edit3 className="w-5 h-5" /></button>
                      {authState === 'owner' && (
                         <button onClick={() => deleteClient(client.id)} className="px-4 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-800/50 transition-all flex items-center"><Trash2 className="w-5 h-5" /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ВИД: КАНБАН */}
          {viewMode === 'kanban' && !showForm && (
             <div className="flex gap-4 overflow-x-auto pb-8 mt-8 min-h-[600px] items-start">
               {['Не связались', 'Думает', 'Внес предоплату', 'Готовится', 'Готов/Доставлен'].map(status => (
                <div key={status} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-[300px] shrink-0 border border-slate-200 dark:border-slate-700 flex flex-col" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const clientId = e.dataTransfer.getData('clientId'); changeOrderStatus(clientId, status); }}>
                  <div className={`p-4 font-black text-sm uppercase rounded-t-2xl border-b border-slate-200 dark:border-slate-700 flex justify-between items-center
                    ${status === 'Внес предоплату' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
                      status === 'Готовится' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' :
                      status === 'Готов/Доставлен' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                      status === 'Думает' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
                  `}>
                    {statusMap[status]} 
                    <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">{filteredClients.filter(c => (c.currentOrderStatus || 'Не связались') === status).length}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-3 flex-1 min-h-[100px]">
                    {filteredClients.filter(c => (c.currentOrderStatus || 'Не связались') === status).map(client => {
                      const nearest = getNearestEvent(client);
                      const displayTitle = getDisplayName(client);
                      
                      let badgeColor = 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600';
                      if (nearest.daysLeft === 0) badgeColor = 'bg-red-500 text-white border-red-600 animate-pulse';
                      else if (nearest.daysLeft <= 3) badgeColor = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
                      else if (nearest.daysLeft <= 7) badgeColor = 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800/50';

                      return (
                        <div key={client.id} draggable onDragStart={(e) => e.dataTransfer.setData('clientId', client.id.toString())} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md transition-shadow relative group">
                          <GripHorizontal className="w-4 h-4 text-slate-300 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                            {displayTitle} {client.isLoyalClient && <Star className="w-3 h-3 fill-amber-400 text-amber-400"/>}
                          </h4>
                          
                          {nearest.daysLeft !== 999 && (
                             <div className={`mt-2 text-[10px] font-bold px-2 py-1 rounded inline-block border ${badgeColor}`}>
                               {nearest.daysLeft === 0 ? 'СЕГОДНЯ!' : `Через ${nearest.daysLeft} дн.`} ({nearest.name})
                             </div>
                          )}

                          {client.purchasedItems && client.purchasedItems.length > 0 && (
                             <div className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded inline-block border border-blue-100 dark:border-blue-900/50">
                               {client.purchasedItems[0].name || 'Товар'}
                             </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
             </div>
          )}

          {/* ВИД: КАЛЕНДАРЬ */}
          {viewMode === 'calendar' && !showForm && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="bg-rose-50 dark:bg-rose-900/30 p-4 rounded-xl border border-rose-100 dark:border-rose-900 mb-6 text-sm text-rose-800 dark:text-rose-200">
                 💡 <b>Умный календарь:</b> Дни рождения повторяются каждый год! Просто переключайте месяцы и годы — события не потеряются. Рядом с именем автоматически выводится возраст.
              </div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl flex items-center gap-2 text-slate-800 dark:text-white"><Calendar className="text-rose-500" /> {t.workload}</h3>
                <div className="flex items-center gap-4">
                  <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-2 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg font-black hover:bg-slate-200 dark:hover:bg-slate-600">&larr;</button>
                  <span className="font-black w-36 text-center uppercase text-sm dark:text-white">{calendarDate.toLocaleString(lang === 'ru' ? 'ru-RU' : 'kk-KZ', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-2 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg font-black hover:bg-slate-200 dark:hover:bg-slate-600">&rarr;</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {(lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сх', 'Жс']).map(d => <div key={d} className="text-center font-bold text-slate-400 py-2">{d}</div>)}
                {renderCalendarDays()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДОСТУПА */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Доступ ограничен</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
              Это действие или страница доступны только для роли <b>"Владелец"</b>. 
            </p>
            <button onClick={() => setShowAccessModal(false)} className="w-full bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-lg">
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp ПОМОЩНИК */}
      {whatsappHelper.show && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#25D366] flex items-center gap-2"><MessageCircle className="w-6 h-6"/> {t.msg}</h3>
              <button onClick={() => setWhatsappHelper({ show: false, client: null, draftText: '', eventName: '' })} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-700 rounded-xl transition"><X className="w-5 h-5"/></button>
            </div>
            
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Шаблоны быстрых ответов:</p>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
               <button onClick={() => setWhatsappHelper({...whatsappHelper, draftText: `Здравствуйте, ${getDisplayName(whatsappHelper.client)}! Приближается ${whatsappHelper.eventName}. Подсказать вам наши начинки на этот год?`})} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-slate-200">Предложить начинку</button>
               <button onClick={() => setWhatsappHelper({...whatsappHelper, draftText: `Здравствуйте, ${getDisplayName(whatsappHelper.client)}! Напоминаю, что скоро ${whatsappHelper.eventName}. Желаете оформить предзаказ со скидкой?`})} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-slate-200">Предзаказ</button>
            </div>

            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Текст сообщения:</p>
            <textarea className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-[#25D366] min-h-[150px] flex-1 mb-4 text-sm font-medium dark:text-white resize-none" value={whatsappHelper.draftText} onChange={e => setWhatsappHelper({...whatsappHelper, draftText: e.target.value})}></textarea>
            
            <div className="flex flex-col gap-2 mt-auto">
               <button onClick={() => sendToWhatsApp('Отправил в WA')} className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/30">
                 <MessageCircle className="w-6 h-6" /> Отправить в WhatsApp
               </button>
               <div className="grid grid-cols-2 gap-2 mt-2">
                 <button onClick={() => sendToWhatsApp('Недозвон/Игнор')} className="py-2 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200">Лог: Игнор</button>
                 <button onClick={() => sendToWhatsApp('Оформил заказ')} className="py-2 bg-blue-100 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-200">Лог: Заказал</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
