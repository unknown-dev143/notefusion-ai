import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Only render on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        shape="circle"
        icon={<SunOutlined />}
        style={{ visibility: 'hidden' }}
      />
    );
  }

  const tooltipText = `Switch to ${
    theme === 'system' 
      ? resolvedTheme === 'light' ? 'dark' : 'light' 
      : theme === 'light' ? 'dark' : 'light'
  } mode`;

  return (
    <Tooltip 
      title={tooltipText} 
      placement="bottom"
      open={tooltipVisible}
      onOpenChange={setTooltipVisible}
      overlayClassName="theme-tooltip"
      mouseEnterDelay={0.5}
    >
      <Button
        type="text"
        shape="circle"
        icon={resolvedTheme === 'light' ? <MoonOutlined /> : <SunOutlined />}
        onClick={() => {
          toggleTheme();
          setTooltipVisible(false);
        }}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        aria-label={tooltipText}
        className="theme-toggle-button"
        style={{
          fontSize: '18px',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
        }}
      />
    </Tooltip>
  );
};
