import React, { useState, useRef } from 'react';
import lekcja1 from '../../assets/lekcja1.jpg';
import styles from './Learn.module.css'; 


const cardData = [
 { 
    topic: 'wave', 
    alt: 'wave', 
    image: lekcja1, 
    title: 'Lekcja 1',
    subtitle: 'Podtytuł lekcji 1',
    description: 'Opis lekcji 1'
  },
 { 
    topic: 'beach', 
    alt: 'beach', 
    image: lekcja1, 
    title: 'Lekcja 2',
    subtitle: 'Podtytuł lekcji 2',
    description: 'Opis lekcji 2'
  },
 { 
    topic: 'mountain', 
    alt: 'mountain', 
    image: lekcja1, 
    title: 'Lekcja 3',
    subtitle: 'Podtytuł lekcji 3',
    description: 'Opis lekcji 3'
  },
 { 
    topic: 'field', 
    alt: 'field', 
    image: lekcja1, 
    title: 'Lekcja 4',
    subtitle: 'Podtytuł lekcji 4',
    description: 'Opis lekcji 4'
  },
 { 
    topic: 'water', 
    alt: 'water', 
    image: lekcja1, 
    title: 'Lekcja 5',
    subtitle: 'Podtytuł lekcji 5',
    description: 'Opis lekcji 5'
  },
 { 
    topic: 'river', 
    alt: 'river', 
    image: lekcja1, 
    title: 'Lekcja 6',
    subtitle: 'Podtytuł lekcji 6',
    description: 'Opis lekcji 6'
  },
 { 
    topic: 'kite', 
    alt: 'kite', 
    image: lekcja1, 
    title: 'Lekcja 7',
    subtitle: 'Podtytuł lekcji 7',
    description: 'Opis lekcji 7'
  },
 { 
    topic: 'underwater', 
    alt: 'underwater', 
    image: lekcja1, 
    title: 'Lekcja 8',
    subtitle: 'Podtytuł lekcji 8',
    description: 'Opis lekcji 8'
  },
 { 
    topic: 'desert', 
    alt: 'desert', 
    image: lekcja1, 
    title: 'Lekcja 9',
    subtitle: 'Podtytuł lekcji 9',
    description: 'Opis lekcji 9'
  },
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