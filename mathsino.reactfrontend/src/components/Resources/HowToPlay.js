// src/components/Resources/HowToPlay.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import './Documentation.css'; 

function HowToPlay() {
  const { t } = useTranslation();

  return (
    <div className="documentation-container"> 
      <header>
        <h1>{t('howtoplay_title')}</h1>
        <p>{t('howtoplay_subtitle')}</p>
      </header>
      
      <div className="doc-content-wrapper">
        <h2>{t('howtoplay_section1_title')}</h2>
        <p>{t('howtoplay_section1_desc')}</p>
        <ul>
          <li>{t('howtoplay_step1')}</li>
          <li>{t('howtoplay_step2')}</li>
          <li>{t('howtoplay_step3')}</li>
        </ul>
        
        <h2>{t('howtoplay_section2_title')}</h2>
        <p>{t('howtoplay_section2_desc')}</p>
        
        <h2>{t('howtoplay_section3_title')}</h2>
        <p>{t('howtoplay_section3_desc')}</p>
      </div>
    </div>
  );
}

export default HowToPlay;