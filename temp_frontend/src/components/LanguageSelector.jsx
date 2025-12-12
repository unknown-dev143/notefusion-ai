import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const { Option } = Select;

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    // Save language preference
    localStorage.setItem('i18nextLng', language);
  };

  return (
    <Select
      defaultValue={i18n.language}
      onChange={changeLanguage}
      style={{ width: 120, marginRight: 16 }}
      bordered={false}
      suffixIcon={<GlobalOutlined />}
    >
      <Option value="en">English</Option>
      <Option value="es">Español</Option>
      {/* Add more languages as needed */}
    </Select>
  );
};

export default LanguageSelector;
