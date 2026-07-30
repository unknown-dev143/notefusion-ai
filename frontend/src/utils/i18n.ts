// Internationalization support
export const languages = {
  en: {
    welcome: 'Welcome to NoteFusion AI',
    dashboard: 'Dashboard',
    upload: 'Upload & Generate',
    whiteboard: 'Whiteboard',
    notes: 'Notes',
    settings: 'Settings',
    free: 'Free & Open Access',
    allFeatures: 'All Features Free',
    graph: 'Graph View',
    tasks: 'Tasks',
    aiTutor: 'AI Tutor',
    calendar: 'Calendar',
    home: 'Home',
    search: 'Deep Search notes...',
    logout: 'Sign Out',
    profile: 'My Profile'
  },
  es: {
    welcome: 'Bienvenido a NoteFusion AI',
    dashboard: 'Panel',
    upload: 'Subir y Generar',
    whiteboard: 'Pizarra',
    notes: 'Notas',
    settings: 'Configuración',
    free: 'Acceso Gratuito',
    allFeatures: 'Todas las Características Gratis',
    graph: 'Vista de Grafo',
    tasks: 'Tareas',
    aiTutor: 'Tutor IA',
    calendar: 'Calendario',
    home: 'Inicio',
    search: 'Búsqueda profunda...',
    logout: 'Cerrar Sesión',
    profile: 'Mi Perfil'
  },
  fr: {
    welcome: 'Bienvenue sur NoteFusion AI',
    dashboard: 'Tableau de bord',
    upload: 'Télécharger et Générer',
    whiteboard: 'Tableau blanc',
    notes: 'Notes',
    settings: 'Paramètres',
    free: 'Accès Gratuit',
    allFeatures: 'Toutes les Fonctionnalités Gratuites',
    graph: 'Vue Graphique',
    tasks: 'Tâches',
    aiTutor: 'Tuteur IA',
    calendar: 'Calendrier',
    home: 'Accueil',
    search: 'Recherche profonde...',
    logout: 'Déconnexion',
    profile: 'Mon Profil'
  },
  de: {
    welcome: 'Willkommen bei NoteFusion AI',
    dashboard: 'Dashboard',
    upload: 'Hochladen & Generieren',
    whiteboard: 'Whiteboard',
    notes: 'Notizen',
    settings: 'Einstellungen',
    free: 'Kostenloser Zugang',
    allFeatures: 'Alle Funktionen Kostenlos',
    graph: 'Graph-Ansicht',
    tasks: 'Aufgaben',
    aiTutor: 'KI-Tutor',
    calendar: 'Kalender',
    home: 'Startseite',
    search: 'Tiefensuche...',
    logout: 'Abmelden',
    profile: 'Mein Profil'
  },
  zh: {
    welcome: '欢迎使用 NoteFusion AI',
    dashboard: '仪表板',
    upload: '上传和生成',
    whiteboard: '白板',
    notes: '笔记',
    settings: '设置',
    free: '免费开放',
    allFeatures: '所有功能免费',
    graph: '图表视图',
    tasks: '任务',
    aiTutor: 'AI 导师',
    calendar: '日历',
    home: '首页',
    search: '深度搜索...',
    logout: '登出',
    profile: '个人资料'
  },
  ja: {
    welcome: 'NoteFusion AIへようこそ',
    dashboard: 'ダッシュボード',
    upload: 'アップロードと生成',
    whiteboard: 'ホワイトボード',
    notes: 'ノート',
    settings: '設定',
    free: '無料アクセス',
    allFeatures: 'すべての機能が無料',
    graph: 'グラフ表示',
    tasks: 'タスク',
    aiTutor: 'AIチューター',
    calendar: 'カレンダー',
    home: 'ホーム',
    search: 'ディープ検索...',
    logout: 'ログアウト',
    profile: 'マイプロフィール'
  }
};

export const getLanguage = (): keyof typeof languages => {
  // Detect browser language
  const browserLang = navigator.language.split('-')[0];
  return (browserLang in languages ? browserLang : 'en') as keyof typeof languages;
};

export const t = (key: string, lang?: keyof typeof languages): string => {
  const currentLang = lang || getLanguage();
  const translations = languages[currentLang] || languages.en;
  return (translations as any)[key] || key;
};

