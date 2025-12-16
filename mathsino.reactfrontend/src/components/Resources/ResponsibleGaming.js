// src/components/Resources/ResponsibleGaming.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import './Documentation.css'; 

function ResponsibleGaming() {
  const { t } = useTranslation();

  return (
    <div className="documentation-container"> 
      <header>
        <h1>{t('rg_title')}</h1>
        <p>{t('rg_subtitle')}</p>
      </header>
      
      <div className="doc-content-wrapper">
        <h2>{t('rg_section1_title')}</h2>
        <p>{t('rg_section1_desc')}</p>
        <ul>
          <li>{t('rg_tip1')}</li>
          <li>{t('rg_tip2')}</li>
          <li>{t('rg_tip3')}</li>
        </ul>

        <h2>{t('rg_section2_title')}</h2>
        <p>{t('rg_section2_desc')}</p>
        <p>
          <strong>{t('rg_helpline_label')}:</strong> 123-456-7890 
          <br />
          <strong>{t('rg_website_label')}:</strong> <a href="#">{t('rg_website_link')}</a>
        </p>
      </div>
    </div>
  );
}

export default ResponsibleGaming;