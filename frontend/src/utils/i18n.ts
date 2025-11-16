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
    allFeatures: 'All Features Free'
  },
  es: {
    welcome: 'Bienvenido a NoteFusion AI',
    dashboard: 'Panel',
    upload: 'Subir y Generar',
    whiteboard: 'Pizarra',
    notes: 'Notas',
    settings: 'Configuración',
    free: 'Acceso Gratuito',
    allFeatures: 'Todas las Características Gratis'
  },
  fr: {
    welcome: 'Bienvenue sur NoteFusion AI',
    dashboard: 'Tableau de bord',
    upload: 'Télécharger et Générer',
    whiteboard: 'Tableau blanc',
    notes: 'Notes',
    settings: 'Paramètres',
    free: 'Accès Gratuit',
    allFeatures: 'Toutes les Fonctionnalités Gratuites'
  },
  de: {
    welcome: 'Willkommen bei NoteFusion AI',
    dashboard: 'Dashboard',
    upload: 'Hochladen & Generieren',
    whiteboard: 'Whiteboard',
    notes: 'Notizen',
    settings: 'Einstellungen',
    free: 'Kostenloser Zugang',
    allFeatures: 'Alle Funktionen Kostenlos'
  },
  zh: {
    welcome: '欢迎使用 NoteFusion AI',
    dashboard: '仪表板',
    upload: '上传和生成',
    whiteboard: '白板',
    notes: '笔记',
    settings: '设置',
    free: '免费开放',
    allFeatures: '所有功能免费'
  },
  ja: {
    welcome: 'NoteFusion AIへようこそ',
    dashboard: 'ダッシュボード',
    upload: 'アップロードと生成',
    whiteboard: 'ホワイトボード',
    notes: 'ノート',
    settings: '設定',
    free: '無料アクセス',
    allFeatures: 'すべての機能が無料'
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

