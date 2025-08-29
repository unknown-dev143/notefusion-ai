import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import './LanguageSelector/LanguageSelector.css';

const { Option } = Select;

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    // Save language preference
    localStorage.setItem('i18nextLng', language);
  };

  const languageOptions = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
  ];

  return (
    <Select
      className="language-selector"
      value={i18n.language}
      onChange={changeLanguage}
      bordered={false}
      suffixIcon={<GlobalOutlined />}
      optionLabelProp="label"
      dropdownMatchSelectWidth={false}
    >
      {languageOptions.map((lang) => (
        <Option key={lang.code} value={lang.code} label={lang.name}>
          <div className="language-option">
            <span className="language-native-name">{lang.nativeName}</span>
            <span className="language-english-name">{lang.name}</span>
          </div>
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSelector;
