// src/components/Resources/DataDeletion.js

import React from 'react';
import { useTranslation } from 'react-i18next'; 
import './Documentation.css'; 

function DataDeletion() {
  const { t } = useTranslation(); 

  return (
    <div className="documentation-container">
      <header>
        <h1>{t('dd_title')}</h1>
      </header>
      
      <div className="doc-content-wrapper">
        <h2>{t('dd_section1_title')}</h2>
        <p>{t('dd_section1_desc')}</p>
        
        <ol>
          <li>{t('dd_step1')}</li>
          <li>{t('dd_step2')}</li>
          <li><strong>{t('dd_step3_title')}:</strong> {t('dd_step3_desc')} <a href="mailto:support@mathsino.com">support@mathsino.com</a>.</li>
        </ol>

        <h2>{t('dd_section2_title')}</h2>
        <p>{t('dd_section2_desc')}</p>
        <ul>
          <li>{t('dd_email_req1')}</li>
          <li>{t('dd_email_req2')}</li>
        </ul>
        <p>{t('dd_confirmation')}</p>
      </div>
    </div>
  );
}

export default DataDeletion;