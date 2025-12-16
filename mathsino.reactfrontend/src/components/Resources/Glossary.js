// src/components/Resources/Glossary.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import './Documentation.css'; 

function Glossary() {
  const { t } = useTranslation();

  return (
    <div className="documentation-container"> 
      <header>
        <h1>{t('glossary_title')}</h1>
        <p>{t('glossary_subtitle')}</p>
      </header>
      
      <div className="doc-content-wrapper"> 
        <h3>{t('glossary_term_blackjack_title')}</h3>
        <p>{t('glossary_term_blackjack_desc')}</p>
        <hr />
        <h3>{t('glossary_term_hit_title')}</h3>
        <p>{t('glossary_term_hit_desc')}</p>
        <hr />
        <h3>{t('glossary_term_stand_title')}</h3>
        <p>{t('glossary_term_stand_desc')}</p>
        <hr />
        <h3>{t('glossary_term_double_title')}</h3>
        <p>{t('glossary_term_double_desc')}</p>
        <hr />
        <h3>{t('glossary_term_split_title')}</h3>
        <p>{t('glossary_term_split_desc')}</p>
      </div>
    </div>
  );
}

export default Glossary;