import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, Phone, MessageCircle, ShoppingBag, User, AlertCircle, Check, Copy, X, Star, Download, Upload, Search, Edit3, FileSpreadsheet, Kanban, List, GripHorizontal, CheckSquare, Info, Sun, Moon, Globe, Cloud, CloudOff } from 'lucide-react';

// --- ИМПОРТЫ FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// --- ВАШИ НАСТРОЙКИ FIREBASE ---
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
    newClient: 'Новый клиент', basicData: 'Основные данные', name: 'Имя *', phone: 'Телефон *', clientBirthday: 'День рождения клиента',
    vip: 'VIP Клиент', allergies: 'Аллергии (Теги)', preferences: 'Предпочтения (Текст)',
    holidays: 'Праздники и Близкие', whoIsEvent: 'Кому праздник', relName: 'Имя близкого',
    relPhone: 'Телефон (Для сюрприза)', eventType: 'Событие', date: 'Дата *', addHoliday: '+ Добавить еще один праздник',
    currentOrder: 'Текущий заказ', prodName: 'Название товара', price: 'Цена (₸)',
    hint: 'Начните вводить или выберите из списка. Если впишете новое название, оно добавится в каталог автоматически.',
    isCustom: '🎨 Это индивидуальный заказ (сложный дизайн)', customDetails: 'Опишите детали заказа: тематика, ярусы, референсы, фигурки, надпись...',
    totalCheck: 'Итого по чеку:', saveChanges: 'СОХРАНИТЬ ИЗМЕНЕНИЯ', addClientBtn: 'ДОБАВИТЬ КЛИЕНТА В БАЗУ',
    msg: 'Сообщение', editDraft: 'Отредактируйте черновик перед отправкой', sendWa: 'Отправить в WhatsApp',
    tips: 'Советы:', tip1: 'Польза, а не спам. Не пишите "у нас акция". Пишите "решил помочь с выбором".',
    tip2: 'Покажите заботу. Упоминание прошлого заказа показывает, что клиент важен.', tip3: 'Один вопрос. Закройте текст простым вопросом.',
    workload: 'Загруженность по дням', noHistory: 'Нет истории покупок', receipt: 'Заказ / Чек', sum: 'Сумма:',
    write: 'Написать', copy: 'Копировать', copied: 'Скопировано', today: 'СЕГОДНЯ!', inDays: (d) => `Через ${d} дн.`,
    customDetailsTitle: 'Индивидуальный заказ (Детали):',
    relationOptions: ['Жене', 'Мужу', 'Сыну', 'Дочери', 'Маме', 'Папе', 'Брату', 'Сестре', 'Другу', 'Другу семьи', 'Коллеге', 'Родственнику', 'Другое'],
    eventOptions: ['День рождения', 'Годовщина', 'Юбилей', 'Другое'],
    myBday: 'Свой День рождения'
  },
  kz: {
    subtitle: 'Кондитерлерге арналған ақылды CRM', inBase: 'Базада', totalSales: 'Жалпы сома',
    list: 'Тізім', board: 'Тақта', calendar: 'Күнтізбе', import: 'Импорт', export: 'Экспорт',
    addClient: 'Клиент қосу', search: 'Базадан іздеу...', editCard: 'Карточканы өңдеу',
    newClient: 'Жаңа клиент', basicData: 'Негізгі деректер', name: 'Аты *', phone: 'Телефон *', clientBirthday: 'Клиенттің туған күні',
    vip: 'VIP Клиент', allergies: 'Аллергия (Тегтер)', preferences: 'Қалаулары (Мәтін)',
    holidays: 'Мерекелер мен Жақындары', whoIsEvent: 'Кімнің мерекесі', relName: 'Жақынының аты',
    relPhone: 'Телефоны (Сыйлық үшін)', eventType: 'Оқиға', date: 'Күні *', addHoliday: '+ Тағы бір мереке қосу',
    currentOrder: 'Ағымдағы тапсырыс', prodName: 'Тауар атауы', price: 'Бағасы (₸)',
    hint: 'Енгізуді бастаңыз немесе тізімнен таңдаңыз. Жаңа атау жазсаңыз, ол каталогқа автоматты қосылады.',
    isCustom: '🎨 Бұл жеке тапсырыс (күрделі дизайн)', customDetails: 'Тапсырыс мәліметтерін сипаттаңыз: тақырып, қабаттар, фигуралар, жазу...',
    totalCheck: 'Чек бойынша барлығы:', saveChanges: 'ӨЗГЕРІСТЕРДІ САҚТАУ', addClientBtn: 'КЛИЕНТТІ БАЗАҒА ҚОСУ',
    msg: 'Хабарлама', editDraft: 'Жібермес бұрын мәтінді өңдеңіз', sendWa: 'WhatsApp-қа жіберу',
    tips: 'Кеңестер:', tip1: 'Спам емес, пайда әкеліңіз. "Бізде акция" деп жазбаңыз. "Таңдауға көмектесейін" деп жазыңыз.',
    tip2: 'Қамқорлық көрсетіңіз. Өткен тапсырысты еске алу клиенттің маңыздылығын көрсетеді.', tip3: 'Бір сұрақ. Мәтінді қарапайым сұрақпен аяқтаңыз.',
    workload: 'Күндер бойынша жүктеме', noHistory: 'Сатып алу тарихы жоқ', receipt: 'Тапсырыс / Чек', sum: 'Сомасы:',
    write: 'Жазу', copy: 'Көшіру', copied: 'Көшірілді', today: 'БҮГІН!', inDays: (d) => `${d} күннен кейін`,
    customDetailsTitle: 'Жеке тапсырыс (Мәліметтер):',
    relationOptions: ['Әйеліме', 'Күйеуіме', 'Ұлыма', 'Қызыма', 'Анама', 'Әкеме', 'Ағама/Ініме', 'Әпкеме/Қарындасыма', 'Досыма', 'Отбасы досына', 'Әріптесіме', 'Туысыма', 'Басқа'],
    eventOptions: ['Туған күн', 'Мерейтой (Годовщина)', 'Мерейтой (Юбилей)', 'Басқа'],
    myBday: 'Өз туған күні'
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const t = translations[lang];

  const getDaysLeft = (targetDate) => {
    if (!targetDate) return 999;
    
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    
    // Берем дату, которую ввел пользователь (например, 2001-05-13)
    const originalDate = new Date(targetDate);
    if (isNaN(originalDate)) return 999;

    // Создаем новую дату: Год берем текущий (2024/2025), а месяц и день — из даты рождения.
    const eventThisYear = new Date(today.getFullYear(), originalDate.getMonth(), originalDate.getDate());
    eventThisYear.setHours(0, 0, 0, 0);

    // Если этот праздник УЖЕ БЫЛ в этом году, значит следующий будет в следующем году (+1 год)
    if (eventThisYear < today) {
      eventThisYear.setFullYear(today.getFullYear() + 1);
    }

    // Считаем разницу в днях между СЕГОДНЯ и ближайшим ПРАЗДНИКОМ
    return Math.ceil((eventThisYear - today) / (1000 * 60 * 60 * 24));
  };

  const getFormatDate = (dateString) => {
    if (!dateString) return lang === 'ru' ? 'Нет данных' : 'Мәлімет жоқ';
    return new Date(dateString).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'kk-KZ', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getNearestEvent = (client) => {
    let allEvents = [...(client.relatives || [])];
    
    if (client.clientBirthday) {
      allEvents.push({
        eventDate: client.clientBirthday,
        relation: t.myBday,
        name: client.clientName
      });
    }

    if (allEvents.length === 0) return { daysLeft: 999, date: null, name: '' };
    
    let nearest = { daysLeft: 999, date: null, name: '' };
    
    allEvents.forEach(rel => {
      const days = getDaysLeft(rel.eventDate);
      // Теперь days всегда будет от 0 до 365, никаких отрицательных чисел!
      if (days >= 0 && days < nearest.daysLeft) {
        nearest = { 
            daysLeft: days, 
            date: rel.eventDate, 
            name: rel.relation + (rel.name && rel.relation !== t.myBday ? ` (${rel.name})` : '') 
        };
      }
    });
    
    return nearest;
  };

  const initialCatalog = [
    "Молочная девочка", "Шоколадный пломбир", "Сникерс", "Нутелла", "Наполеон", "Медовик", "Чизкейк испанский", "Пирог 23см", "Пирог 18см", "Трайфл", 
    "Моти", "Эклер", "Мини испанский", "Макаронс", "Круассан куриный", "Круассан семга", "Круассан нутелла", "Круассан фисташка", "Круассан клубника", 
    "Круассан орео", "Круассан сыр", "Круассан классика", "Корпусный фисташка", "Корпусный кокос", "Корпусный манго", "Корпусный малина", "Корпусный черника", 
    "Корпусный круассан", "Бенто торт", "Фрезье", "Минидесерты", "Меренговый рулет"
  ];
  const [catalog, setCatalog] = useState(initialCatalog);
  const [clients, setClients] = useState([]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 
  const [whatsappHelper, setWhatsappHelper] = useState({ show: false, client: null, draftText: '' });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [orderInput, setOrderInput] = useState({ name: '', price: '' });
  
  const AVAILABLE_TAGS = ['🔴 Арахис (Аллергия)', '🟡 Без глютена', '🟢 Веган', '🔵 Без сахара', '🟣 Без лактозы'];

  const initialNewClientState = { 
    clientName: '', phone: '+7 ', clientBirthday: '', isLoyalClient: false, tags: [], preferences: '',
    relatives: [{ id: Date.now(), relation: 'Жене', name: '', phone: '', eventDate: '', eventType: 'День рождения' }],
    isCustomOrder: false, customOrderDetails: '', purchasedItems: [], totalPrice: 0, currentOrderStatus: 'Не связались'
  };
  const [newClient, setNewClient] = useState(initialNewClientState);
  const fileInputRef = useRef(null);

  const totalSales = clients.reduce((sum, c) => sum + (c.totalPrice || 0), 0);
  const filteredClients = clients.filter(c => c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery));

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
    if (!newClient.clientName || newClient.phone.length < 18) return;
    
    const clientId = editingId ? editingId.toString() : Date.now().toString();
    const clientData = { ...newClient, id: clientId };
    
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', clientId), clientData);
      setNewClient(initialNewClientState);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Ошибка при сохранении клиента в Firebase", error);
    }
  };

  const editClientClick = (client) => {
    setNewClient({ ...client, tags: client.tags || [], relatives: client.relatives || [], purchasedItems: client.purchasedItems || [] });
    setEditingId(client.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteClient = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()));
    } catch (error) {
      console.error("Ошибка при удалении клиента", error);
    }
  };
  
  const changeOrderStatus = async (id, newStatus) => {
    try {
      const clientToUpdate = clients.find(c => c.id === id);
      if (clientToUpdate) {
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', id.toString()), { ...clientToUpdate, currentOrderStatus: newStatus });
      }
    } catch(e) {
       console.error("Ошибка обновления статуса", e);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ clients, catalog }, null, 2);
    const url = URL.createObjectURL(new Blob([dataStr], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `toffee_crm_backup_${new Date().toLocaleDateString('ru-RU')}.json`; link.click(); URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const bom = "\uFEFF";
    let csvContent = bom + "Имя,Телефон,ДР Клиента,Близкие и Праздники,Сумма чека,VIP,Статус,Диета,Предпочтения,Индив.заказ,Детали инд.заказа,Товары\n";
    clients.forEach(c => {
      const itemsStr = (c.purchasedItems || []).map(i => i.name).join("; ");
      const tagsStr = c.tags ? c.tags.join("; ") : "";
      const relativesStr = (c.relatives || []).map(r => `${r.relation} ${r.name || ''} ${r.phone ? `(${r.phone})` : ''} [${r.eventDate}]`).join(" | ");
      const row = [`"${c.clientName}"`, `"${c.phone}"`, `"${c.clientBirthday || ''}"`, `"${relativesStr}"`, c.totalPrice, c.isLoyalClient ? "Да" : "Нет", `"${c.currentOrderStatus || 'Не связались'}"`, `"${tagsStr}"`, `"${c.preferences || ''}"`, c.isCustomOrder ? "Да" : "Нет", `"${c.customOrderDetails || ''}"`, `"${itemsStr}"`].join(",");
      csvContent += row + "\n";
    });
    const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `toffee_clients_table_${new Date().toLocaleDateString('ru-RU')}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const importedClients = Array.isArray(data) ? data : (data.clients || []);
        for (const client of importedClients) {
           await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'clients', client.id.toString()), client);
        }
      } catch (error) { console.error('Ошибка импорта'); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const statusMap = {
    'Не связались': lang === 'kz' ? 'Байланыс жоқ' : 'Связи нет',
    'Думает': lang === 'kz' ? 'Ойлануда' : 'Думает',
    'Внес предоплату': lang === 'kz' ? 'Алдын ала төлем' : 'Предоплата',
    'Готовится': lang === 'kz' ? 'Дайындалуда' : 'В производстве',
    'Готов/Доставлен': lang === 'kz' ? 'Дайын/Жеткізілді' : 'Завершен'
  };

  const onDragStart = (e, clientId) => e.dataTransfer.setData('clientId', clientId.toString());
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, targetStatus) => {
    const clientId = e.dataTransfer.getData('clientId');
    changeOrderStatus(clientId, targetStatus);
  };

  const openWhatsAppHelper = (client) => {
    const nearest = getNearestEvent(client);
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
    const textToCopy = `👤 Имя: ${client.clientName} ${client.isLoyalClient ? '⭐ (VIP)' : ''}\n📱 Телефон: ${client.phone}\n${client.clientBirthday ? `🎂 ДР Клиента: ${getFormatDate(client.clientBirthday)}\n` : ''}📅 Праздники близких:\n${relativesList || '- Нет данных -'}\n${tagsStr}${prefStr}${customOrderStr}\n\n🛒 Заказ (на сумму ${client.totalPrice || 0} ₸):\n${itemsList || '- Пусто -'}`.trim();
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
      
      // Ищем совпадения ТОЛЬКО по месяцу и дню (например "05-13")
      const searchMonthDay = `${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      
      const eventsOnThisDay = [];
      filteredClients.forEach(c => {
         // Проверяем ДР самого клиента (сравниваем конец строки)
         if (c.clientBirthday && c.clientBirthday.endsWith(searchMonthDay)) {
             eventsOnThisDay.push({ client: c, rel: { relation: t.myBday } });
         }
         // Проверяем ДР близких
         (c.relatives || []).forEach(rel => { 
             if (rel.eventDate && rel.eventDate.endsWith(searchMonthDay)) {
                 eventsOnThisDay.push({ client: c, rel: rel }); 
             }
         });
      });

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

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-20 transition-colors duration-300">
        <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />

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
              </div>

              <div className="flex gap-2 items-center bg-white/10 p-1.5 rounded-2xl backdrop-blur-md justify-center shadow-sm">
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'list' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`}><List className="w-5 h-5" /> <span className="hidden md:inline">{t.list}</span></button>
                <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'kanban' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`}><Kanban className="w-5 h-5" /> <span className="hidden md:inline">{t.board}</span></button>
                <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-xl transition flex items-center gap-2 font-bold text-sm ${viewMode === 'calendar' ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm' : 'text-white hover:bg-white/20'}`}><Calendar className="w-5 h-5" /> <span className="hidden md:inline">{t.calendar}</span></button>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"><Upload className="w-4 h-4" /> {t.import}</button>
                <button onClick={exportData} className="flex-1 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"><Download className="w-4 h-4" /> {t.export}</button>
                <button onClick={exportCSV} className="bg-[#107c41] hover:bg-[#188c4d] text-white p-2 rounded-xl font-bold flex items-center justify-center transition shadow-sm" title="Excel"><FileSpreadsheet className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-20px] relative z-20">
          {!showForm && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button onClick={() => { setNewClient(initialNewClientState); setEditingId(null); setShowForm(true); }} className="md:w-1/3 bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 py-4 rounded-2xl font-bold shadow-md border-b-4 border-rose-200 dark:border-rose-900 flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all">
                <Plus className="w-6 h-6" /> {t.addClient}
              </button>
              <div className="md:w-2/3 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                <input type="text" placeholder={t.search} className="w-full h-full min-h-[56px] pl-11 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-rose-400 dark:focus:border-rose-500 outline-none shadow-sm text-slate-700 dark:text-slate-200 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          )}

          {showForm && (
            <form onSubmit={addClient} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 mb-8 space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">{editingId ? t.editCard : t.newClient}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:bg-slate-700 rounded-xl transition"><X className="w-6 h-6"/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{t.clientBirthday}</label>
                    <input type="date" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-slate-700 dark:text-slate-300 font-bold" value={newClient.clientBirthday || ''} onChange={e => setNewClient({...newClient, clientBirthday: e.target.value})} />
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

          {viewMode === 'list' && !showForm && (
            <div className="space-y-4 mt-8">
              {filteredClients.map(client => {
                const nearestEvent = getNearestEvent(client);
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
                            {client.clientBirthday && (
                               <p className="text-sm font-bold text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1">
                                 🎂 {getFormatDate(client.clientBirthday)}
                               </p>
                            )}
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
                            <select value={client.currentOrderStatus || 'Не связались'} onChange={(e) => changeOrderStatus(client.id, e.target.value)} className="text-xs font-bold px-3 py-1.5 rounded-lg border dark:border-slate-600 outline-none cursor-pointer shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              {Object.entries(statusMap).map(([ruKey, displayValue]) => <option key={ruKey} value={ruKey}>{displayValue}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t.holidays}</h4>
                          {(client.relatives || []).length > 0 ? (client.relatives || []).map(rel => (
                            <div key={rel.id} className="bg-pink-50 dark:bg-pink-900/20 text-pink-900 dark:text-pink-300 p-3 rounded-xl border border-pink-100 dark:border-pink-900/30 flex justify-between items-center">
                              <div>
                                 <span className="font-bold text-sm">{rel.relation} {rel.name ? `(${rel.name})` : ''}</span>
                                 {rel.phone && <p className="text-[10px] font-mono mt-0.5 text-pink-600 dark:text-pink-400 font-bold">{rel.phone}</p>}
                                 <p className="text-xs mt-0.5">{rel.eventType} — <b>{getFormatDate(rel.eventDate)}</b></p>
                              </div>
                              <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded text-pink-600 dark:text-pink-400 shadow-sm">{getDaysLeft(rel.eventDate)} дн.</span>
                            </div>
                          )) : <p className="text-sm text-slate-400 dark:text-slate-500 mb-3 italic">-</p>}
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
                  <div className="
