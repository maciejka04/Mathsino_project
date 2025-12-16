// src/components/Resources/PrivacyPolicy.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Documentation.css'; 

function PrivacyPolicy() {
  const { t } = useTranslation(); 

  return (
    <div className="documentation-container"> 
      <header>
        <h1>{t('pp_title')}</h1>
        <p>{t('pp_effective_date')}</p>
      </header>

      <div className="doc-content-wrapper">
        <h2>{t('pp_section1_title')}</h2>
        <p>{t('pp_section1_desc')}</p>
        <ul>
          <li><strong>{t('pp_data_email')}</strong> {t('pp_data_email_desc')}</li>
          <li><strong>{t('pp_data_name')}</strong> {t('pp_data_name_desc')}</li>
          <li><strong>{t('pp_data_id')}</strong> {t('pp_data_id_desc')}</li>
        </ul>

        <h2>{t('pp_section2_title')}</h2>
        <p>{t('pp_section2_desc')}</p>
        <ul>
          <li>{t('pp_use_auth')}</li>
          <li>{t('pp_use_progress')}</li>
          <li>{t('pp_use_personalization')}</li>
        </ul>

        <h2>{t('pp_section3_title')}</h2>
        <p>{t('pp_section3_desc')}</p>
        <p>
          <Link to="/resources/data-deletion">{t('pp_data_deletion_link')}</Link>
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;