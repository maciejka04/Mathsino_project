
import React from "react";
import { motion } from "framer-motion";
import reverseCardImage from "../../../assets/karty/reverse2.png";
import { calculateHandValue } from "../utils/CardUtils";

const Hand = ({ 
  cards, 
  deckPosition, 
  title, 
  gameStatus, 
  isDealer = false, 
  leftPositionBase = 46, 
  isActive = false,      
  hasSplit = false 
}) => {
  
  const handValue = cards.length > 0 
    ? (isDealer && gameStatus === "InProgress" && cards.length === 2
        ? calculateHandValue(cards.slice(0, 1))
        : calculateHandValue(cards))
    : 0;

  return (
    <>
      {/* Wyświetlanie wartości punktowej */}
      {cards.length > 0 && (
        <div 
            className={`hand-value ${isDealer ? 'dealer-value' : 'player-main-value'}`}
            style={!isDealer ? { left: hasSplit && !title.includes('2') ? "40%" : (title.includes('2') ? "60%" : "50%") } : {}}
        >
          {title} <span style={{ fontWeight: "bold" }}>{handValue}</span>
        </div>
      )}

      {/* Karty */}
      {cards.map((card, index) => {
        const isFaceDown = isDealer && index === 1 && gameStatus === "InProgress";
        
        
        let finalLeft = leftPositionBase + index * 3;
        
        if (!isDealer && hasSplit && !title.includes('2')) finalLeft -= 10;
        
        const startX = `${deckPosition.left - finalLeft}vw`;
        const startY = isDealer 
            ? `${deckPosition.top - 10}vh` 
            : `${deckPosition.top - 40}vh`;

        return (
          <motion.div
            key={`${isDealer ? 'dealer' : 'player'}-${index}-${card.name}`}
            className={`card-image ${isDealer ? 'dealer-card' : 'player-card'}`}
            style={{ 
                left: `${finalLeft}%`,
                border: isActive && gameStatus === "InProgress" ? "2px solid gold" : "none"
            }}
            initial={{
              x: startX,
              y: startY,
              opacity: 0,
              scale: 0.5,
              rotate: isDealer ? 180 : -180,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              rotate: 0,
              rotateY: isFaceDown ? 180 : 0,
            }}
            transition={{
              duration: isDealer ? 0.6 : 0.7,
              delay: index * 0.2 + (isDealer ? 0 : 0.1),
              type: "spring",
              stiffness: 80,
            }}
          >
             {/* Jeśli dealer, to wrapper motion.div jest kontenerem, a img w srodku */}
             {isDealer ? (
                 <img
                    src={isFaceDown ? reverseCardImage : card.src}
                    alt={isFaceDown ? "Zakryta karta" : card.name}
                    style={{ width: "100%", height: "100%", borderRadius: "4px" }}
                 />
             ) : (
                 <img
                    src={card.src}
                    alt={card.name}
                    style={{ width: "100%", height: "100%", borderRadius: "4px" }}
                 />
             )}
          </motion.div>
        );
      })}
    </>
  );
};

export default Hand;