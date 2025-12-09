import React from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:5126';

export default function LanguageToggle({ userId }) {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = React.useState(i18n.language || 'en');

  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
    if (userId) {
      try {
        await fetch(`${API_URL}/users/${userId}/language`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lng }),
        });
      } catch (e) {
        console.error('Failed to update language', e);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={() => changeLanguage('en')} disabled={lang === 'en'}>{t('lang_en')}</button>
      <button onClick={() => changeLanguage('pl')} disabled={lang === 'pl'}>{t('lang_pl')}</button>
    </div>
  );
}
