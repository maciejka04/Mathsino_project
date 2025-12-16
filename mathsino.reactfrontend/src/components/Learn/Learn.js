import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import lekcja1 from '../../assets/lekcja1.jpg';
import styles from './Learn.module.css'; 
import audioService from '../../services/audioService';
import clickSound from '../../assets/mouse-click.mp3';
import { isZeroValueString } from 'framer-motion';

const playClickSound = () => {
  audioService.playSoundEffect(clickSound);
}

const cardData = [
 { 
    id: 1, 
    topic: 'wave', 
    alt: 'wave', 
    image: lekcja1, 
    title: 'learn_l1_title',
    subtitle: 'learn_l1_subtitle',
    description: 'learn_l1_desc'
  },
 { 
    id: 2,
    topic: 'beach', 
    alt: 'beach', 
    image: lekcja1, 
    title: 'learn_l2_title',
    subtitle: 'learn_l2_subtitle',
    description: 'learn_l2_desc'
  },
 { 
    id: 3,
    topic: 'mountain', 
    alt: 'mountain', 
    image: lekcja1, 
    title: 'learn_l3_title',
    subtitle: 'learn_l3_subtitle',
    description: 'learn_l3_desc'
  },
 { 
    id: 4,
    topic: 'field', 
    alt: 'field', 
    image: lekcja1, 
    title: 'learn_l4_title',
    subtitle: 'learn_l4_subtitle',
    description: 'learn_l4_desc'
  },
 { 
    id: 5,
    topic: 'water', 
    alt: 'water', 
    image: lekcja1, 
    title: 'learn_l5_title',
    subtitle: 'learn_l5_subtitle',
    description: 'learn_l5_desc'
  },
 { 
    id: 6,
    topic: 'river', 
    alt: 'river', 
    image: lekcja1, 
    title: 'learn_l6_title',
    subtitle: 'learn_l6_subtitle',
    description: 'learn_l6_desc'
  },
 { 
    id: 7,
    topic: 'kite', 
    alt: 'kite', 
    image: lekcja1, 
    title: 'learn_l7_title',
    subtitle: 'learn_l7_subtitle',
    description: 'learn_l7_desc'
  },
 { 
    id: 8,
    topic: 'underwater', 
    alt: 'underwater', 
    image: lekcja1, 
    title: 'learn_l8_title',
    subtitle: 'learn_l8_subtitle',
    description: 'learn_l8_desc'
  },
 { 
    id: 9,
    topic: 'desert', 
    alt: 'desert', 
    image: lekcja1, 
    title: 'learn_l9_title',
    subtitle: 'learn_l9_subtitle',
    description: 'learn_l9_desc'
  },
   { 
    id: 10,
    topic: 'desert', 
    alt: 'desert', 
    image: lekcja1, 
    title: 'learn_l10_title',
    subtitle: 'learn_l9_subtitle',
    description: 'learn_l9_desc'
  },
     { 
    id: 11,
    topic: 'desert', 
    alt: 'desert', 
    image: lekcja1, 
    title: 'learn_l11_title',
    subtitle: 'learn_l9_subtitle',
    description: 'learn_l9_desc'
  },
];

function Learn({ image, alt, isShowing, zIndex, onClick, title, subtitle, description, onReadMore }) {
  const { t } = useTranslation(); 

  return (
    <div
      className={`${styles.card} ${isShowing ? styles.show : ''}`}
      style={{ zIndex: zIndex }}
      onClick={(e) => { playClickSound(); onClick(e); }}
    >
      <div className={styles['card__image-holder']}>
        <img className={styles['card__image']} src={image} alt={alt} />
      </div>
      <div className={styles['card-title']}>
        
        <a href="#" className={`${styles['toggle-info']} ${styles.btn}`} onClick={(e) => e.preventDefault()}>
          <span className={styles.left}></span>
          <span className={styles.right}></span>
        </a>

        <h2>
          {}
          {t(title)}
          <small>{t(subtitle)}</small>
        </h2>
      </div>
      <div className={`${styles['card-flap']} ${styles.flap1}`}>
        <div className={styles['card-description']}>
           {}
          {t(description)}
        </div>
        <div className={`${styles['card-flap']} ${styles.flap2}`}>
          <div className={styles['card-actions']}>
            
            <a 
                href="#" 
                className={styles.btn} 
                onClick={(e) => {
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  playClickSound();
                  onReadMore(); 
              }}
            >
              {}
              {t('learn_read_more')}
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}


function CardGrid() {
  const zIndexCounter = useRef(10);
  const [activeIndex, setActiveIndex] = useState(null);
  const [cardZIndexes, setCardZIndexes] = useState({});
  
  const navigate = useNavigate(); 

  const handleCardClick = (e, clickedIndex) => {
    e.preventDefault();
    const newZIndex = zIndexCounter.current++;
    setCardZIndexes(prev => ({
      ...prev,
      [clickedIndex]: newZIndex
    }));
    setActiveIndex(prevActiveIndex => 
      prevActiveIndex === clickedIndex ? null : clickedIndex
    );
  };

  const handleReadMoreClick = (lessonId) => {
      navigate(`/lesson/${lessonId}`);
  };

  const isShowing = activeIndex !== null;

  return (
    <div className={`${styles.cards} ${isShowing ? styles.showing : ''}`}>
      {cardData.map((card, index) => (
        <Learn
          key={card.topic} 
          image={card.image}
          alt={card.alt}
          
          title={card.title}
          subtitle={card.subtitle}
          description={card.description}
          
          isShowing={activeIndex === index}
          zIndex={cardZIndexes[index] || 1}
          onClick={(e) => handleCardClick(e, index)}
          onReadMore={() => handleReadMoreClick(card.id)} 
        />
      ))}
    </div>
  );
}

export default CardGrid;