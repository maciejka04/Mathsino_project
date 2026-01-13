import React, { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import lekcja1 from '../../assets/lessonpic/lesson1.png';
import lekcja2 from '../../assets/lessonpic/lesson2.png';
import lekcja3 from '../../assets/lessonpic/lesson3.png';
import lekcja4 from '../../assets/lessonpic/lesson4.png';
import lekcja5 from '../../assets/lessonpic/lesson5.png';
import lekcja6 from '../../assets/lessonpic/lesson6.png';
import lekcja7 from '../../assets/lessonpic/lesson7.png';
import lekcja8 from '../../assets/lessonpic/lesson8.png';
import lekcja9 from '../../assets/lessonpic/lesson9.png';
import lekcja10 from '../../assets/lessonpic/lesson10.png';
import lekcja11 from '../../assets/lessonpic/lesson11.png';

import lockIcon from '../../assets/lock.png';

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
    image: lekcja2, 
    title: 'learn_l2_title',
    subtitle: 'learn_l2_subtitle',
    description: 'learn_l2_desc'
  },
 { 
    id: 3,
    topic: 'mountain', 
    alt: 'mountain', 
    image: lekcja3, 
    title: 'learn_l3_title',
    subtitle: 'learn_l3_subtitle',
    description: 'learn_l3_desc'
  },
 { 
    id: 4,
    topic: 'field', 
    alt: 'field', 
    image: lekcja4, 
    title: 'learn_l4_title',
    subtitle: 'learn_l4_subtitle',
    description: 'learn_l4_desc'
  },
 { 
    id: 5,
    topic: 'water', 
    alt: 'water', 
    image: lekcja5, 
    title: 'learn_l5_title',
    subtitle: 'learn_l5_subtitle',
    description: 'learn_l5_desc'
  },
 { 
    id: 6,
    topic: 'river', 
    alt: 'river', 
    image: lekcja6, 
    title: 'learn_l6_title',
    subtitle: 'learn_l6_subtitle',
    description: 'learn_l6_desc'
  },
 { 
    id: 7,
    topic: 'kite', 
    alt: 'kite', 
    image: lekcja7, 
    title: 'learn_l7_title',
    subtitle: 'learn_l7_subtitle',
    description: 'learn_l7_desc'
  },
 { 
    id: 8,
    topic: 'underwater', 
    alt: 'underwater', 
    image: lekcja8, 
    title: 'learn_l8_title',
    subtitle: 'learn_l8_subtitle',
    description: 'learn_l8_desc'
  },
 { 
    id: 9,
    topic: 'deserts', 
    alt: 'deserts', 
    image: lekcja9, 
    title: 'learn_l9_title',
    subtitle: 'learn_l9_subtitle',
    description: 'learn_l9_desc'
  },
   { 
    id: 10,
    topic: 'desert', 
    alt: 'desert', 
    image: lekcja10, 
    title: 'learn_l10_title',
    subtitle: 'learn_l10_subtitle',
    description: 'learn_l10_desc'
  },
     { 
    id: 11,
    topic: 'desertt', 
    alt: 'desertt', 
    image: lekcja11, 
    title: 'learn_l11_title',
    subtitle: 'learn_l11_subtitle',
    description: 'learn_l11_desc'
  },
];

function Learn({ image, alt, isShowing, zIndex, onClick, title, subtitle, description, onReadMore, isLocked }) {
  const { t } = useTranslation(); 

  return (
    <div
      className={`${styles.card} ${isShowing ? styles.show : ''} ${isLocked ? styles.locked : ''}`}
      style={{ zIndex: zIndex }}
      onClick={(e) => { 
        if (isLocked) return; 
        playClickSound(); 
        onClick(e); 
      }}
    >
      <div className={styles['card__image-holder']}>
        <img className={styles['card__image']} src={image} alt={alt} />
        {isLocked && (
          <div className={styles.lockOverlay}>
            <img src={lockIcon} alt="Locked" className={styles.lockIcon} />
          </div>
        )}
      </div>
      <div className={styles['card-title']}>
        {!isLocked && (
          <a href="#" className={`${styles['toggle-info']} ${styles.btn}`} onClick={(e) => e.preventDefault()}>
            <span className={styles.left}></span>
            <span className={styles.right}></span>
          </a>
        )}

        <h2>
          {t(title)}
          <small>{t(subtitle)}</small>
        </h2>
      </div>
      
      {!isLocked && (
        <div className={`${styles['card-flap']} ${styles.flap1}`}>
          <div className={styles['card-description']}>
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
                {t('learn_read_more')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ProgressBar = ({ completed }) => {
  const { t } = useTranslation();
  const totalLessons = 11;
  const percentage = Math.round((completed / totalLessons) * 100);

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressLabel}>
        {t('learn_progress_label') || "Your progress"}: {percentage}%
      </div>
      <div className={styles.progressBase}>
        <div 
          className={styles.progressFill} 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: '#4caf50', 
            height: '100%',
            transition: 'width 0.5s ease-out' 
          }}
        ></div>
      </div>
    </div>
  );
};

function CardGrid() {
  const zIndexCounter = useRef(10);
  const [activeIndex, setActiveIndex] = useState(null);
  const [cardZIndexes, setCardZIndexes] = useState({});
  
  const { user } = useOutletContext();
  const navigate = useNavigate(); 

  const completed = user?.lessonsCompleted || 0;

  const handleCardClick = (e, clickedIndex, isLocked) => {
    if (isLocked) return;
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

  const isShowing = activeIndex !== null;

  return (
    <div className={styles.learnWrapper}>
      <ProgressBar completed={completed} />
      <div className={`${styles.cards} ${isShowing ? styles.showing : ''}`}>
        {cardData.map((card, index) => {
          const isLocked = card.id > (completed + 1);

          return (
            <Learn
              key={card.id} 
              image={card.image}
              alt={card.alt}
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              isShowing={activeIndex === index}
              zIndex={cardZIndexes[index] || 1}
              isLocked={isLocked}
              onClick={(e) => handleCardClick(e, index, isLocked)}
              onReadMore={() => !isLocked && navigate(`/lesson/${card.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CardGrid;