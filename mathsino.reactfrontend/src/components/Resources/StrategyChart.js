// src/components/Resources/StrategyChart.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import './Documentation.css'; 
import tabelaImage from '../../assets/tabela.png';

function StrategyChart() {
  const { t } = useTranslation();

  return (
    <div className="documentation-container"> 
      <header>
        <h1>{t('strategychart_title')}</h1>
        <p>{t('strategychart_subtitle')}</p>
      </header>
      
      <div className="doc-content-wrapper">
        <h2>{t('strategychart_intro_title')}</h2>
        <p>{t('strategychart_intro_desc')}</p>

        <div className="strategy-chart-placeholder">
          <img 
            src={tabelaImage} 
            className="strategy-chart-image"
          />
        </div>

        <h3>{t('strategychart_rules_title')}</h3>
        <ul>
          <li>{t('strategychart_rule1')}</li>
          <li>{t('strategychart_rule2')}</li>
          <li>{t('strategychart_rule3')}</li>
        </ul>
      </div>
    </div>
  );
}

export default StrategyChart;