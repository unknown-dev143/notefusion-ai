import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorLink: '#1890ff',
    colorTextBase: 'rgba(0, 0, 0, 0.85)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',
    fontSize: 14,
    borderRadius: 4,
    wireframe: false,
  },
  components: {
    Button: {
      primaryColor: '#fff',
    },
    Input: {
      activeBorderColor: '#1890ff',
      hoverBorderColor: '#40a9ff',
      activeShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
    },
    Layout: {
      headerBg: '#fff',
      siderBg: '#fff',
      bodyBg: '#f5f5f5',
    },
    Menu: {
      itemSelectedBg: '#e6f7ff',
      itemSelectedColor: '#1890ff',
      itemHoverColor: '#40a9ff',
      itemHoverBg: 'transparent',
      itemActiveBg: 'transparent',
    },
  },
};
