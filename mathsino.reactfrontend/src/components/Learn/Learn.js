import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. NOWY IMPORT
import lekcja1 from '../../assets/lekcja1.jpg';
import styles from './Learn.module.css'; 

const cardData = [
 { 
    id: 1, 
    topic: 'wave', 
    alt: 'wave', 
    image: lekcja1, 
    title: 'Lekcja 1',
    subtitle: 'Podtytuł lekcji 1',
    description: 'Opis lekcji 1'
  },
 { 
    id: 2,
    topic: 'beach', 
    alt: 'beach', 
    image: lekcja1, 
    title: 'Lekcja 2',
    subtitle: 'Podtytuł lekcji 2',
    description: 'Opis lekcji 2'
  },
 { 
    id: 3,
    topic: 'mountain', 
    alt: 'mountain', 
    image: lekcja1, 
    title: 'Lekcja 3',
    subtitle: 'Podtytuł lekcji 3',
    description: 'Opis lekcji 3'
  },
 { 
    id: 4,
    topic: 'field', 
    alt: 'field', 
    image: lekcja1, 
    title: 'Lekcja 4',
    subtitle: 'Podtytuł lekcji 4',
    description: 'Opis lekcji 4'
  },
 { 
    id: 5,
    topic: 'water', 
    alt: 'water', 
    image: lekcja1, 
    title: 'Lekcja 5',
    subtitle: 'Podtytuł lekcji 5',
    description: 'Opis lekcji 5'
  },
 { 
    id: 6,
    topic: 'river', 
    alt: 'river', 
    image: lekcja1, 
    title: 'Lekcja 6',
    subtitle: 'Podtytuł lekcji 6',
    description: 'Opis lekcji 6'
  },
 { 
    id: 7,
    topic: 'kite', 
    alt: 'kite', 
    image: lekcja1, 
    title: 'Lekcja 7',
    subtitle: 'Podtytuł lekcji 7',
    description: 'Opis lekcji 7'
  },
 { 
    id: 8,
    topic: 'underwater', 
    alt: 'underwater', 
    image: lekcja1, 
    title: 'Lekcja 8',
    subtitle: 'Podtytuł lekcji 8',
    description: 'Opis lekcji 8'
  },
 { 
    id: 9,
    topic: 'desert', 
    alt: 'desert', 
    image: lekcja1, 
    title: 'Lekcja 9',
    subtitle: 'Podtytuł lekcji 9',
    description: 'Opis lekcji 9'
  },
];

// Odbieramy nową funkcję "onReadMore" w propsach
function Learn({ image, alt, isShowing, zIndex, onClick, title, subtitle, description, onReadMore }) {
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
        
        <a href="#" className={`${styles['toggle-info']} ${styles.btn}`} onClick={(e) => e.preventDefault()}>
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
            
            {/* ZMIANA: Obsługa kliknięcia Read More */}
            <a 
                href="#" 
                className={styles.btn} 
                onClick={(e) => {
                    e.preventDefault(); // Nie przeładowuj strony
                    e.stopPropagation(); // Nie zamykaj karty (bo karta ma onClick)
                    onReadMore(); // Uruchom nawigację
                }}
            >
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
  
  const navigate = useNavigate(); // <--- Inicjalizacja nawigacji

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

  // Nowa funkcja do przenoszenia do lekcji
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
          
          // Przekazujemy funkcję do dziecka
          onReadMore={() => handleReadMoreClick(card.id)} 
        />
      ))}
    </div>
  );
}

export default CardGrid;