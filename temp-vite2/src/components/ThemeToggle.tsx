import { Button, Dropdown, Space, Tooltip } from 'antd';
import { 
  BulbOutlined, 
  BulbFilled, 
  SettingOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, setTheme, isDarkMode } = useTheme();

  const items = [
    {
      key: 'light',
      label: 'Light',
      icon: theme === 'light' ? <CheckOutlined /> : <span style={{ width: 16 }} />,
      onClick: () => setTheme('light'),
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: theme === 'dark' ? <CheckOutlined /> : <span style={{ width: 16 }} />,
      onClick: () => setTheme('dark'),
    },
    {
      type: 'divider',
    },
    {
      key: 'system',
      label: 'System',
      icon: theme === 'system' ? <CheckOutlined /> : <span style={{ width: 16 }} />,
      onClick: () => setTheme('system'),
    },
  ];

  return (
    <Dropdown 
      menu={{ items }} 
      trigger={['click']}
      placement="bottomRight"
    >
      <Tooltip title="Change theme">
        <Button 
          type="text" 
          icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'var(--primary-color)'
          }}
        />
      </Tooltip>
    </Dropdown>
  );
};

export default ThemeToggle;
