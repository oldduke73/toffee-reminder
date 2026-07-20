import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Calendar, Phone, MessageCircle, ShoppingBag, User, 
  AlertCircle, Check, Copy, X, Star, Download, Upload, Search, 
  Edit3, FileSpreadsheet, Kanban, List, GripHorizontal, Sun, Moon, 
  Globe, Cloud, CloudOff, Lock, Unlock, LogOut, Cake 
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
    addClient: 'Добавить клиента', search: 'Поиск по базе...', editCard: 'Редактировать карточку',
    newClient: 'Новый клиент', basicData: 'Основные данные', name: 'Имя *', phone: 'Телефон *',
    vip: 'VIP Клиент', allergies: 'Аллергии (Теги)', preferences: 'Предпочтения (Текст)',
    holidays: 'Праздники и Близкие', whoIsEvent: 'Кому праздник', relName: 'Имя близкого',
    relPhone: 'Телефон (Для сюрприза)', eventType: 'Событие', date: 'Дата *', addHoliday: '+ Добавить еще один праздник',
    currentOrder: 'Текущий заказ', prodName: 'Название товара', price: 'Цена (₸)',
    hint: 'Начните вводить или выберите из списка. Если впишете новое название, оно добавится в каталог автоматически.',
    isCustom: '🎨 Это индивидуальный заказ (сложный дизайн)', customDetails: 'Опишите детали заказа...',
    totalCheck: 'Итого по чеку:', saveChanges: 'СОХРАНИТЬ ИЗМЕНЕНИЯ', addClientBtn: 'ДОБАВИТЬ КЛИЕНТА В БАЗУ',
    msg: 'Сообщение', write: 'Написать', copy: 'Копировать', copied: 'Скопировано', today: 'СЕГОДНЯ!', inDays: (d) => `Через ${d} дн.`,
    customDetailsTitle: 'Индивидуальный заказ (Детали):', workload: 'Загруженность по дням', noHistory: 'Нет истории', receipt: 'Чек', sum: 'Сумма:',
    relationOptions: ['Себе', 'Жене', 'Мужу', 'Сыну', 'Дочери', 'Маме', 'Папе', 'Брату', 'Сестре', 'Другу', 'Другу семьи', 'Коллеге', 'Родственнику'],
    eventOptions: ['День рождения', 'Годовщина', 'Юбилей', 'Другое']
  },
  kz: {
    subtitle: 'Кондитерлерге арналған ақылды CRM', inBase: 'Базада', totalSales: 'Жалпы сома',
    list: 'Тізім', board: 'Тақта', calendar: 'Күнтізбе', import: 'Импорт', export: 'Экспорт',
    addClient: 'Клиент қосу', search: 'Базадан іздеу...', editCard: 'Карточканы өңдеу',
    newClient: 'Жаңа клиент', basicData: 'Негізгі деректер', name: 'Аты *', phone: 'Телефон *',
    vip: 'VIP Клиент', allergies: 'Аллергия (Тегтер)', preferences: 'Қалаулары (Мәтін)',
    holidays: 'Мерекелер мен Жақындары', whoIsEvent: 'Кімнің мерекесі', relName: 'Жақынының аты',
    relPhone: 'Телефоны (Сыйлық үшін)', eventType: 'Оқиға', date: 'Күні *', addHoliday: '+ Тағы бір мереке қосу',
    currentOrder: 'Ағымдағы тапсырыс', prodName: 'Тауар атауы', price: 'Бағасы (₸)',
    hint: 'Енгізуді бастаңыз немесе тізімнен таңдаңыз...',
    isCustom: '🎨 Бұл жеке тапсырыс', customDetails: 'Тапсырыс мәліметтерін сипаттаңыз...',
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

const App = () => {
  // Авторизация
  const [authState, setAuthState] = useState('logged_out'); // 'logged_out', 'guest', 'admin'
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Глобальные состояния
  const [user, setUser] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const t = translations[lang];

  // Данные
  const [catalog, setCatalog] = useState(initialCatalog);
  const [clients, setClients] = useState([]);
  
  // UI состояния
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCake, setFilterCake] = useState('All');
  
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 
  const [whatsappHelper, setWhatsappHelper] = useState({ show: false, client: null, draftText: '' });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [orderInput, setOrderInput] = useState({ name: '', price: '' });
  const fileInputRef = useRef(null);

  const handleProtectedAction = (actionFn) => {
    if (authState === 'guest') {
      setShowAccessModal(true);
      return;
    }
    actionFn();
  };

  const initialNewClientState = { 
    clientName: '', phone: '+7 ', isLoyalClient: false, tags: [], preferences: '',
    relatives: [{ id: Date.now(), relation: 'Себе', name: '', phone: '', eventDate: '', eventType: 'День рождения' }],
    isCustomOrder: false, customOrderDetails: '', purchasedItems: [], totalPrice: 0, currentOrderStatus: 'Не связались'
  };
  const [newClient, setNewClient] = useState(initialNewClientState);

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
    const safeRelatives = relatives || [];
    if (safeRelatives.length === 0) return { daysLeft: 999, date: null, name: '' };
    let nearest = { daysLeft: 999, date: null, name: '' };
    safeRelatives.forEach(rel => {
      const days = getDaysLeft(rel.eventDate);
      if (days >= 0 && days < nearest.daysLeft) nearest = { daysLeft: days, date: rel.eventDate, name: rel.relation + (rel.name ? ` (${rel.name})` : '') };
    });
    if (nearest.daysLeft === 999) {
       const sorted = [...safeRelatives].sort((a,b) => new Date(b.eventDate) - new Date(a.eventDate));
       nearest = { daysLeft: getDaysLeft(sorted[0].eventDate), date: sorted[0].eventDate, name: sorted[0].relation };
    }
    return nearest;
  };

  useEffect(() => {
    if (authState === 'logged_out') return;

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Ошибка авторизации Firebase:", e);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [authState]);

  useEffect(() => {
    if (!user || authState === 'logged_out') return;
    
    const clientsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'clients');
    const unsubscribeClients = onSnapshot(clientsRef, (snapshot) => {
      const loadedClients = [];
      snapshot.forEach(doc => loadedClients.push({ ...doc.data(), id: doc.id }));
      setClients(loadedClients);
      setIsDbConnected(true);
    }, (error) => {
      console.error("Ошибка загрузки клиентов", error);
      setIsDbConnected(false);
    });

    const catalogRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'catalog');
    const unsubscribeCatalog = onSnapshot(catalogRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        setCatalog(docSnap.data().items);
      }
    }, (error) => console.error("Ошибка загрузки каталога", error));

    return () => { unsubscribeClients(); unsubscribeCatalog(); };
  }, [user, authState]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (client.clientName && client.clientName.toLowerCase().includes(query)) ||
        (client.phone && client.phone.includes(query)) ||
        (client.purchasedItems && client.purchasedItems.some(item => item.name.toLowerCase().includes(query)));

      const matchesFilter = filterCake === 'All' || 
        (client.purchasedItems && client.purchasedItems.some(item => item.name.toUpperCase() === filterCake.toUpperCase()));

      return matchesSearch && matchesFilter;
    });
  }, [clients, searchQuery, filterCake]);

  const totalSales = clients.reduce((sum, c) => sum + (c.totalPrice || 0), 0);

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

  const addRelative = () => setNewClient({ ...newClient, relatives: [...(newClient.relatives || []), { id: Date.now(), relation: 'Другу', name: '', phone: '', eventDate: '', eventType: 'День рождения' }] });
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
    const updatedPrice = updatedItems.reduce((sum, item) => sum + parseInt(item.price), 0);
    setNewClient({ ...newClient, purchasedItems: updatedItems, totalPrice: updatedPrice });
    
    if (!catalog.includes(formattedName)) {
      const newCatalog = [...catalog, formattedName];
      setCatalog(newCatalog);
      try {
         await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'catalog'), { items: newCatalog });
      } catch(e) {}
    }
    setOrderInput({ name: '', price: '' });
  };

  const removeOrderItem = (uniqueId) => {
    const updatedItems = (newClient.purchasedItems || []).filter(item => item.uniqueId !== uniqueId);
    const updatedPrice = updatedItems.reduce((sum, item) => sum + parseInt(item.price), 0);
    setNewClient({ ...newClient, purchasedItems: updatedItems, totalPrice: updatedPrice });
  };

  const addClient = async (e) => {
    e.preventDefault();
    handleProtectedAction(async () => {
      if (!newClient.clientName || newClient.phone.length < 18) return;
      const clientId = editingId ? editingId.toString() : Date.now().toString();
      const clientData = { ...newClient, id: clientId };
      
      try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), clientData);
        setNewClient(initialNewClientState);
        setShowForm(false);
        setEditingId(null);
      } catch (error) {
        console.error("Ошибка сохранения:", error);
      }
    });
  };

  const editClientClick = (client) => {
    handleProtectedAction(() => {
      setNewClient({ ...client, tags: client.tags || [], relatives: client.relatives || [], purchasedItems: client.purchasedItems || [] });
      setEditingId(client.id);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const deleteClient = (id) => {
    handleProtectedAction(async () => {
      try {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()));
      } catch (error) {
        console.error("Ошибка удаления:", error);
      }
    });
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

  const exportCSV = () => {
    const bom = "\uFEFF";
    let csvContent = bom + "Имя,Телефон,ДР Клиента,VIP,Статус,Сумма покупок,Аллергии,Предпочтения,Праздники близких,Заказы,Индив.дизайн\n";
    clients.forEach(c => {
      const itemsStr = (c.purchasedItems || []).map(i => i.name).join("; ");
      const tagsStr = c.tags ? c.tags.join("; ") : "";
      
      let mainBirthday = "";
      if (c.relatives && c.relatives.length > 0) {
        const selfRel = c.relatives.find(r => r.relation === 'Себе' || r.relation === 'Өзіме');
        if (selfRel) mainBirthday = selfRel.eventDate;
      }

      const relativesStr = (c.relatives || []).map(r => `${r.relation} ${r.name || ''} [${r.eventDate}]`).join(" | ");
      const row = [
        `"${c.clientName || ''}"`, `"${c.phone || ''}"`, `"${mainBirthday}"`, 
        c.isLoyalClient ? "Да" : "Нет", `"${c.currentOrderStatus || 'Не связались'}"`, 
        c.totalPrice || 0, `"${tagsStr}"`, `"${c.preferences || ''}"`, 
        `"${relativesStr}"`, `"${itemsStr}"`, `"${c.customOrderDetails || ''}"`
      ].join(",");
      csvContent += row + "\n";
    });
    const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; 
    link.download = `toffee_clients_${new Date().toLocaleDateString('ru-RU')}.csv`; 
    link.click(); URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    handleProtectedAction(() => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const delimiter = text.includes(';') ? ';' : ',';
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const dataLines = lines.slice(1);
          
          let importCount = 0;

          for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const row = line.split(delimiter).map(cell => cell ? cell.trim().replace(/^"|"$/g, '') : "");
            if (!row[0]) continue; // Пропуск пустых имен

            // Умный парсинг даты
            let formattedDate = "";
            if (row[2]) {
              const dateStr = row[2].trim();
              if (/^\d{1,2}\.\d{1,2}$/.test(dateStr)) {
                const [day, month] = dateStr.split('.');
                formattedDate = `2026-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              } else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
                const [day, month, year] = dateStr.split('.');
                formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              } else {
                formattedDate = dateStr; 
              }
            }

            const itemsStr = row[9] || "";
            const items = itemsStr ? itemsStr.split(';').map(item => ({ uniqueId: Date.now() + Math.random(), name: item.trim(), price: 0 })) : [];
            const tags = row[6] ? row[6].split(';').map(t => t.trim()).filter(t => t) : [];

            const newClientData = {
              id: Date.now().toString() + i,
              clientName: row[0] || "",
              phone: row[1] || "",
              isLoyalClient: row[3] === 'Да',
              currentOrderStatus: row[4] || "Не связались",
              totalPrice: parseInt(row[5]) || 0,
              tags: tags,
              preferences: row[7] || "",
              relatives: formattedDate ? [{ id: Date.now(), relation: 'Себе', name: row[0] || "", phone: row[1] || "", eventDate: formattedDate, eventType: 'День рождения' }] : [],
              purchasedItems: items,
              // Защита от undefined при импорте
              isCustomOrder: (row[10] && row[10].trim().length > 0) ? true : false,
              customOrderDetails: row[10] || ""
            };

            await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', newClientData.id), newClientData);
            importCount++;
          }
          
          console.log(`Успешно импортировано клиентов: ${importCount}`);
        } catch (error) { 
          console.error('Ошибка импорта CSV:', error); 
        }
      };
      reader.readAsText(file, 'UTF-8'); // Принудительно читаем в UTF-8
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const onDragStart = (e, clientId) => {
    if (authState === 'guest') { e.preventDefault(); handleProtectedAction(() => {}); return; }
    e.dataTransfer.setData('clientId', clientId.toString());
  };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, targetStatus) => {
    if (authState === 'guest') return;
    const clientId = e.dataTransfer.getData('clientId');
    changeOrderStatus(clientId, targetStatus);
  };

  const openWhatsAppHelper = (client) => {
    const nearest = getNearestEvent(client.relatives);
    let timeText = nearest.daysLeft === 0 ? "уже сегодня" : nearest.daysLeft === 1 ? "завтра" : `через ${nearest.daysLeft} дн.`;
    let itemsText = (client.purchasedItems && client.purchasedItems.length > 0) ? `В прошлом году вы брали у нас ${client.purchasedItems[0].name.toLowerCase()}.` : "";
    const draftText = `Здравствуйте, ${client.clientName}! \nПишу вам, чтобы помочь с подготовкой: ${timeText} праздник (${nearest.name}). \n${itemsText} \nСделать для вас подборку начинок и свободных окошек на эту дату?`;
    setWhatsappHelper({ show: true, client, draftText });
  };
  
  const sendToWhatsApp = () => {
    window.open(`https://wa.me/${whatsappHelper.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappHelper.draftText)}`, '_blank');
    setWhatsappHelper({ show: false, client: null, draftText: '' });
  };

  const copyToClipboard = (client) => {
    const itemsList = (client.purchasedItems || []).map(i => `- ${i.name} (${i.price} ₸)`).join('\n');
    const tagsStr = client.tags && client.tags.length > 0 ? `\n⚠️ Особенности: ${client.tags.join(', ')}` : '';
    const prefStr = client.preferences ? `\n📝 Предпочтения: ${client.preferences}` : '';
    const customOrderStr = client.isCustomOrder ? `\n🎨 ИНДИВИДУАЛЬНЫЙ ЗАКАЗ:\n${client.customOrderDetails}` : '';
    const relativesList = (client.relatives || []).map(r => `  - ${r.relation} ${r.name || ''} ${r.phone ? `📞 ${r.phone}` : ''} (${getFormatDate(r.eventDate)})`).join('\n');
    const textToCopy = `👤 Имя: ${client.clientName} ${client.isLoyalClient ? '⭐ (VIP)' : ''}\n📱 Телефон: ${client.phone}\n📅 Праздники близких:\n${relativesList}\n${tagsStr}${prefStr}${customOrderStr}\n\n🛒 Заказ (на сумму ${client.totalPrice || 0} ₸):\n${itemsList || '- Пусто -'}`.trim();
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
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const eventsOnThisDay = [];
      filteredClients.forEach(c => (c.relatives || []).forEach(rel => { if (rel.eventDate === dateStr) eventsOnThisDay.push({ client: c, rel: rel }); }));
      return (
        <div key={d} className={`min-h-[80px] p-2 rounded-xl border flex flex-col ${eventsOnThisDay.length > 0 ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
          <span className={`text-sm font-bold ${eventsOnThisDay.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>{d}</span>
          <div className="mt-1 flex flex-col gap-1">
            {eventsOnThisDay.map((e, idx) => (
              <div key={idx} onClick={() => editClientClick(e.client)} className="text-[10px] font-bold text-white bg-rose-500 rounded px-1.5 py-1 truncate cursor-pointer hover:bg-rose-600 shadow-sm" title={`${e.client.clientName} (${e.rel.relation})`}>
                {e.client.clientName}
              </div>
            ))}
          </div>
        </div>
      );
    });
    return [...blanks, ...days];
  };

  const allProductNames = Array.from(new Set([...catalog, ...clients.flatMap(c => (c.purchasedItems || []).map(i => i.name))])).sort();

  if (authState === 'logged_out') {
    const [loginInput, setLoginInput] = useState('');
    const [passInput, setPassInput] = useState('');
    const [authError, setAuthError] = useState('');

    const handleLogin = (e) => {
      e.preventDefault();
      if (loginInput === 'Toffee2026' && passInput === 'crm0803') {
        setAuthState('admin');
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
            <p className="text-slate-500 mt-2 font-medium">Система управления клиентами</p>
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
              <Unlock className="w-5 h-5" /> Войти как Администратор
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">или</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button onClick={() => setAuthState('guest')} className="w-full bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" /> Демо-режим (Только просмотр)
          </button>
        </div>
      </div>
    );
  }

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
                 <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${authState === 'admin' ? 'bg-green-500/20 text-green-100 border-green-400/30' : 'bg-white/20 text-white border-white/30'}`}>
                   {authState === 'admin' ? <Unlock className="w-3 h-3"/> : <Lock className="w-3 h-3"/>} 
                   {authState === 'admin' ? 'Полный доступ' : 'Только просмотр'}
                 </span>
                 {isDbConnected ? 
                   <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-500/20 text-blue-100 px-2 py-0.5 rounded-full border border-blue-400/30"><Cloud className="w-3 h-3"/> Online</span> :
                   <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30"><CloudOff className="w-3 h-3"/> Sync...</span>
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
                <button onClick={() => setAuthState('logged_out')} className="bg-white/20 hover:bg-red-500/80 text-white p-2 rounded-xl flex items-center transition shadow-sm">
                  <LogOut className="w-5 h-5"/>
                </button>
              </div>

              <div className="flex gap-2 items-center bg-white/10 p-1.5 rounded-2xl backdrop-blur-md justify-center shadow-sm">
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'list' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`}><List className="w-5 h-5" /> <span className="hidden md:inline">{t.list}</span></button>
                <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'kanban' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`}><Kanban className="w-5 h-5" /> <span className="hidden md:inline">{t.board}</span></button>
                <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'calendar' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`}><Calendar className="w-5 h-5" /> <span className="hidden md:inline">{t.calendar}</span></button>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button onClick={() => handleProtectedAction(() => fileInputRef.current?.click())} className="flex-1 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"><Upload className="w-4 h-4" /> {t.import} CSV</button>
                <button onClick={exportCSV} className="bg-[#107c41] hover:bg-[#188c4d] text-white px-4 p-2 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm" title="Excel"><FileSpreadsheet className="w-4 h-4" /> Excel</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-20px] relative z-20">
          
          {}
          {!showForm && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button onClick={() => handleProtectedAction(() => { setNewClient(initialNewClientState); setEditingId(null); setShowForm(true); })} className="md:w-1/4 shrink-0 bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 py-4 rounded-2xl font-bold shadow-md border-b-4 border-rose-200 dark:border-rose-900 flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all">
                <Plus className="w-6 h-6" /> {t.addClient}
              </button>
              
              <div className="flex-1 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                  <input type="text" placeholder="Поиск (Имя, Телефон, Торт)..." className="w-full h-full min-h-[56px] pl-11 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-rose-400 dark:focus:border-rose-500 outline-none shadow-sm text-slate-700 dark:text-slate-200 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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

          {}
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
                      <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none dark:text-white" value={newClient.clientName} onChange={e => setNewClient({...newClient, clientName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.phone}</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none font-medium dark:text-white" value={newClient.phone} onChange={handlePhoneChange} maxLength={18} />
                    </div>
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
                      {index > 0 && <button type="button" onClick={() => removeRelative(relative.id)} className="absolute top-2 right-2 text-pink-300 hover:text-red-500"><X className="w-5 h-5" /></button>}
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

          {}
          {viewMode === 'list' && !showForm && (
            <div className="space-y-4 mt-8">
              {filteredClients.map(client => {
                const nearestEvent = getNearestEvent(client.relatives);
                const isUrgent = nearestEvent.daysLeft >= 0 && nearestEvent.daysLeft <= 5;

                return (
                  <div key={client.id} className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border-2 transition-all ${isUrgent ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-700'}`}>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                              {client.clientName} {client.isLoyalClient && <Star className="w-5 h-5 fill-amber-400 text-amber-400"/>}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{client.phone}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            {isUrgent && (
                              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-4 py-1.5 rounded-full font-bold mb-2 animate-pulse">
                                <AlertCircle className="w-4 h-4" /> {nearestEvent.daysLeft === 0 ? t.today : t.inDays(nearestEvent.daysLeft)}
                              </div>
                            )}
                            {!isUrgent && nearestEvent.daysLeft !== 999 && (
                              <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold mb-2">{t.inDays(nearestEvent.daysLeft)}</div>
                            )}
                            <select value={client.currentOrderStatus || 'Не связались'} onChange={(e) => changeOrderStatus(client.id, e.target.value)} disabled={authState === 'guest'} className="text-xs font-bold px-3 py-1.5 rounded-lg border dark:border-slate-600 outline-none cursor-pointer shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50">
                              {Object.entries(statusMap).map(([ruKey, displayValue]) => <option key={ruKey} value={ruKey}>{displayValue}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t.holidays}</h4>
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
                            {client.purchasedItems.map(item => <li key={item.uniqueId}>• {item.name} ({item.price} ₸)</li>)}
                          </ul>
                        ) : <p className="text-sm text-slate-400 dark:text-slate-500 mb-3 italic">{t.noHistory}</p>}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t.sum}</span>
                          <span className="font-black text-slate-800 dark:text-white text-lg">{client.totalPrice} ₸</span>
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
                      <button onClick={() => deleteClient(client.id)} className="px-4 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-800/50 transition-all flex items-center"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {}
          {viewMode === 'kanban' && !showForm && (
             <div className="flex gap-4 overflow-x-auto pb-8 mt-8 min-h-[600px] items-start">
               {['Не связались', 'Думает', 'Внес предоплату', 'Готовится', 'Готов/Доставлен'].map(status => (
                <div key={status} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-[300px] shrink-0 border border-slate-200 dark:border-slate-700 flex flex-col" onDragOver={onDragOver} onDrop={(e) => onDrop(e, status)}>
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
                      const nearest = getNearestEvent(client.relatives);
                      return (
                        <div key={client.id} draggable onDragStart={(e) => onDragStart(e, client.id)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md transition-shadow relative group">
                          <GripHorizontal className="w-4 h-4 text-slate-300 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                            {client.clientName} {client.isLoyalClient && <Star className="w-3 h-3 fill-amber-400 text-amber-400"/>}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{nearest.name} — {getFormatDate(nearest.date)}</p>
                          {client.purchasedItems && client.purchasedItems.length > 0 && (
                             <div className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded inline-block border border-blue-100 dark:border-blue-900/50">
                               {client.purchasedItems[0].name}
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

          {}
          {viewMode === 'calendar' && !showForm && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
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

      {}
      {showAccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Доступ ограничен</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
              Вы находитесь в гостевом режиме. Для редактирования, удаления или импорта данных необходимо войти под учетной записью Администратора.
            </p>
            <button onClick={() => setShowAccessModal(false)} className="w-full bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-lg">
              Понятно
            </button>
          </div>
        </div>
      )}

      {whatsappHelper.show && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#25D366] flex items-center gap-2"><MessageCircle className="w-6 h-6"/> {t.msg}</h3>
              <button onClick={() => setWhatsappHelper({ show: false, client: null, draftText: '' })} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-700 rounded-xl transition"><X className="w-5 h-5"/></button>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Черновик сообщения:</p>
            <textarea className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-[#25D366] min-h-[150px] mb-6 text-sm font-medium dark:text-white resize-none" value={whatsappHelper.draftText} onChange={e => setWhatsappHelper({...whatsappHelper, draftText: e.target.value})}></textarea>
            
            <button onClick={sendToWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/30">
              <MessageCircle className="w-6 h-6" /> Отправить в WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
