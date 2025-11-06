import React, { useState, useRef } from 'react';
import lekcja1 from '../../assets/lekcja1.jpg';
import styles from './Learn.module.css'; 


const cardData = [
  { 
    topic: 'wave', 
    alt: 'wave', 
    image: lekcja1, 
    title: 'Karta Fal', 
    subtitle: 'Zdjęcie fali', 
    description: 'To jest niestandardowy opis dla pierwszej karty o falach.' 
  },
  { 
    topic: 'beach', 
    alt: 'beach', 
    image: lekcja1, 
    title: 'Karta Plaży', 
    subtitle: 'Zdjęcie plaży', 
    description: 'Tutaj jest zupełnie inny opis, dotyczący plaży.'
  },
  { 
    topic: 'mountain', 
    alt: 'mountain', 
    image: lekcja1, 
    title: 'Card title', 
    subtitle: 'Image from unsplash.com', 
    description: 'This grid is an attempt to make something nice that works on touch devices.'
  },
  { topic: 'field', alt: 'field', image: lekcja1, title: 'Card title', subtitle: 'Image from unsplash.com', description: 'This grid is an attempt...'},
  { topic: 'water', alt: 'water', image: lekcja1, title: 'Card title', subtitle: 'Image from unsplash.com', description: 'This grid is an attempt...'},
  { topic: 'river', alt: 'river', image: lekcja1, title: 'Card title', subtitle: 'Image from unsplash.com', description: 'This grid is an attempt...'},
  { topic: 'kite', alt: 'kite', image: lekcja1, title: 'Card title', subtitle: 'Image from unsplash.com', description: 'This grid is an attempt...'},
  { topic: 'underwater', alt: 'underwater', image: lekcja1, title: 'Card title', subtitle: 'Image from unsplash.com', description: 'This grid is an attempt...'},
  { topic: 'desert', alt: 'desert', image: lekcja1, title: 'Card title', subtitle: 'Image from unsplash.com', description: 'This grid is an attempt...'},
];



  function Learn({ image, alt, isShowing, zIndex, onClick, title, subtitle, description }) {
  return (
    <div
      className={`${styles.card} ${isShowing ? styles.show : ''}`}
      style={{ zIndex: zIndex }}
      onClick={onClick}
    >
      <div className={styles['card__image-holder']}>
        <img className={styles['card__image']} src={image} alt={alt} />
      </div>
      <div className={styles['card-title']}>
        
        {}
        <a href="#" className={`${styles['toggle-info']} ${styles.btn}`}>
          <span className={styles.left}></span>
          <span className={styles.right}></span>
        </a>

        <h2>
          {title}
          <small>{subtitle}</small>
        </h2>
      </div>
      <div className={`${styles['card-flap']} ${styles.flap1}`}>
        <div className={styles['card-description']}>
          {description}
        </div>
        <div className={`${styles['card-flap']} ${styles.flap2}`}>
          <div className={styles['card-actions']}>
            {}
            <a href="#" className={styles.btn}>
              Read more
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
        />
      ))}
    </div>
  );
}

export default CardGrid;