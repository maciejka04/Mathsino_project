// src/components/Resources/TermsOfService.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import './Documentation.css'; 

function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="documentation-container"> 
      <header>
        <h1>{t('tos_title')}</h1>
        <p>{t('tos_subtitle')}</p>
      </header>
      <div className="doc-content-wrapper">
        <h2>{t('tos_section1_title')}</h2>
        <p>{t('tos_section1_desc')}</p>

        <h2>{t('tos_section2_title')}</h2>
        <p>{t('tos_section2_desc')}</p>
        
        <h2>{t('tos_section3_title')}</h2>
        <p>{t('tos_section3_desc')}</p>

        <p>{t('tos_last_updated')}</p>
      </div>
    </div>
  );
}

export default TermsOfService;