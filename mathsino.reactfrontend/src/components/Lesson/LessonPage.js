import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- IMPORTY STYLÓW I GRAFIK ---
import '../Offline/Offline.css'; 
import tableImage from '../../assets/table4.png';
import reverseCardImage from '../../assets/karty/reverse.png';

// --- IMPORTY LEKCJI ---
import lesson1 from '../../assets/lekcje/lekcja1.json';
import lesson2 from '../../assets/lekcje/lekcja2.json';
import lesson3 from '../../assets/lekcje/lekcja3.json';
import lesson4 from '../../assets/lekcje/lekcja4.json';
import lesson5 from '../../assets/lekcje/lekcja5.json';
import lesson6 from '../../assets/lekcje/lekcja6.json';
import lesson7 from '../../assets/lekcje/lekcja7.json';
import lesson8 from '../../assets/lekcje/lekcja8.json';
import lesson9 from '../../assets/lekcje/lekcja9.json';

// Mapa lekcji
const lessonsMap = {
  1: lesson1,
  2: lesson2,
  3: lesson3,
  4: lesson4,
  5: lesson5,
  6: lesson6,
  7: lesson7,
  8: lesson8,
  9: lesson9
};

// --- HELPERY DO KART ---
const allCardFileNames = [
    '2_of_hearts', '3_of_hearts', '4_of_hearts', '5_of_hearts', '6_of_hearts', '7_of_hearts', '8_of_hearts', '9_of_hearts', '10_of_hearts', 'jack_of_hearts', 'queen_of_hearts', 'king_of_hearts', 'ace_of_hearts',
    '2_of_diamonds', '3_of_diamonds', '4_of_diamonds', '5_of_diamonds', '6_of_diamonds', '7_of_diamonds', '8_of_diamonds', '9_of_diamonds', '10_of_diamonds', 'jack_of_diamonds', 'queen_of_diamonds', 'king_of_diamonds', 'ace_of_diamonds',
    '2_of_clubs', '3_of_clubs', '4_of_clubs', '5_of_clubs', '6_of_clubs', '7_of_clubs', '8_of_clubs', '9_of_clubs', '10_of_clubs', 'jack_of_clubs', 'queen_of_clubs', 'king_of_clubs', 'ace_of_clubs',
    '2_of_spades', '3_of_spades', '4_of_spades', '5_of_spades', '6_of_spades', '7_of_spades', '8_of_spades', '9_of_spades', '10_of_spades', 'jack_of_spades', 'queen_of_spades', 'king_of_spades', 'ace_of_spades'
];

const cardImagesMap = allCardFileNames.reduce((acc, cardName) => {
    try {
        acc[cardName] = require(`../../assets/karty/${cardName}.png`);
    } catch (e) {}
    return acc;
}, {});

const mapJsonCardToFilename = (cardCode) => {
    if (!cardCode) return null;
    let rank = cardCode.toUpperCase();
    
    if (rank === '10') rank = '10';
    else if (rank === 'A') rank = 'ace';
    else if (rank === 'K') rank = 'king';
    else if (rank === 'Q') rank = 'queen';
    else if (rank === 'J') rank = 'jack';
    
    return `${rank.toLowerCase()}_of_spades`; 
};

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentLessonData = lessonsMap[id];

  // --- STAN APLIKACJI ---
  // NOWOŚĆ: lessonPhase steruje tym, co wyświetlamy: 'INTRO', 'GAME', 'CONCLUSION'
  const [lessonPhase, setLessonPhase] = useState('INTRO'); 

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [dealerCards, setDealerCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [splitCards, setSplitCards] = useState([]);
  const [hasSplit, setHasSplit] = useState(false);
  
  const [feedbackText, setFeedbackText] = useState("");
  const [avatarPose, setAvatarPose] = useState("A");
  const [isScenarioFinished, setIsScenarioFinished] = useState(false);
  const [isWrongAction, setIsWrongAction] = useState(false);

  // Pobieramy scenariusz (bezpiecznie)
  const scenario = currentLessonData ? currentLessonData.scenarios[currentScenarioIndex] : null;

  // --- 1. SETUP PRZY ZMIANIE LEKCJI (Reset) ---
  useEffect(() => {
    if (currentLessonData) {
        // Zawsze zaczynamy od INTRO
        setLessonPhase('INTRO');
        setCurrentScenarioIndex(0);
        setCurrentStepIndex(0);
        setDealerCards([]);
        setPlayerCards([]);
        setSplitCards([]);
        
        // Ładujemy tekst powitalny
        if (currentLessonData.introduction) {
            setFeedbackText(currentLessonData.introduction.text);
            setAvatarPose(currentLessonData.introduction.avatar_pose);
        }
    }
  }, [currentLessonData]); // Wykona się tylko jak zmienimy lekcję (np. z 1 na 2)


  // --- 2. SETUP SCENARIUSZA (Tylko w fazie GAME) ---
  useEffect(() => {
    // Uruchamiamy tylko jeśli jesteśmy w fazie gry i mamy scenariusz
    if (lessonPhase === 'GAME' && scenario) {
      setHasSplit(false);
      setSplitCards([]);
      setIsScenarioFinished(false);
      setIsWrongAction(false);
      
      const pCards = scenario.setup.player_hand.map(code => ({
          name: code,
          src: cardImagesMap[mapJsonCardToFilename(code)]
      }));
      setPlayerCards(pCards);

      const dCards = [
          { name: scenario.setup.dealer_up_card, src: cardImagesMap[mapJsonCardToFilename(scenario.setup.dealer_up_card)] },
          { name: 'HIDDEN', src: cardImagesMap[mapJsonCardToFilename(scenario.setup.dealer_hidden_card)] }
      ];
      setDealerCards(dCards);

      setCurrentStepIndex(0);
      if (scenario.sequence.length > 0) {
        setFeedbackText(scenario.sequence[0].text);
        setAvatarPose(scenario.sequence[0].avatar_pose);
      }
    }
  }, [lessonPhase, currentScenarioIndex, scenario]); // Zależy od Fazy i Numeru scenariusza


  // --- FUNKCJE NAWIGACJI ---

  // Kliknięcie "Let's Start" po Intro
  const startLesson = () => {
      setLessonPhase('GAME');
  };

  const handleAction = (actionType) => {
    if (lessonPhase !== 'GAME' || isScenarioFinished || !scenario) return;

    const currentStep = scenario.sequence[currentStepIndex];

    if (actionType === currentStep.required_action) {
      setIsWrongAction(false);

      if (currentStep.cards_added && currentStep.cards_added.length > 0) {
         const newCards = currentStep.cards_added.map(code => ({
            name: code,
            src: cardImagesMap[mapJsonCardToFilename(code)]
         }));
         setPlayerCards(prev => [...prev, ...newCards]);
      }

      if (actionType === 'SPLIT') {
          setHasSplit(true);
          const card1 = playerCards[0];
          const newCard1 = { src: cardImagesMap[mapJsonCardToFilename(currentStep.cards_added_hand_1[0])] };
          const newCard2 = { src: cardImagesMap[mapJsonCardToFilename(currentStep.cards_added_hand_2[0])] };

          setPlayerCards([card1, newCard1]);
          setSplitCards([playerCards[1], newCard2]);
      }

      const nextStepIndex = currentStepIndex + 1;
      
      if (nextStepIndex < scenario.sequence.length) {
        setCurrentStepIndex(nextStepIndex);
        setFeedbackText(scenario.sequence[nextStepIndex].text);
        setAvatarPose(scenario.sequence[nextStepIndex].avatar_pose);
      } else {
        finishScenario();
      }

    } else {
      setIsWrongAction(true);
      setFeedbackText("Nie, to nie jest dobra decyzja w tej sytuacji. Spróbuj czegoś innego!");
      setAvatarPose("C");
    }
  };

  const finishScenario = () => {
    if (!scenario) return;
    setIsScenarioFinished(true);
    const finishData = scenario.finish;
    
    setFeedbackText(finishData.text);
    setAvatarPose(finishData.avatar_pose);

    setDealerCards(prev => {
        const newCards = [...prev];
        const hiddenRank = scenario.setup.dealer_hidden_card;
        newCards[1] = { name: hiddenRank, src: cardImagesMap[mapJsonCardToFilename(hiddenRank)] };
        
        if (finishData.dealer_draws) {
             const extraCards = finishData.dealer_draws.map(code => ({
                name: code,
                src: cardImagesMap[mapJsonCardToFilename(code)]
             }));
             return [...newCards, ...extraCards];
        }
        return newCards;
    });
  };

  const nextStep = () => {
    // Jeśli to był ostatni scenariusz -> idziemy do CONCLUSION
    if (currentScenarioIndex + 1 < currentLessonData.scenarios.length) {
      setCurrentScenarioIndex(prev => prev + 1);
    } else {
      // Koniec scenariuszy, wczytujemy podsumowanie
      setLessonPhase('CONCLUSION');
      if (currentLessonData.conclusion) {
          setFeedbackText(currentLessonData.conclusion.text);
          setAvatarPose(currentLessonData.conclusion.avatar_pose);
          // Możemy wyczyścić stół na koniec
          setDealerCards([]);
          setPlayerCards([]);
          setSplitCards([]);
      }
    }
  };

  // --- OCHRONA PRZED BRAKIEM DANYCH ---
  if (!currentLessonData) {
      return (
        <div className="offline-container">
            <h1 style={{color: 'white'}}>Nie znaleziono lekcji nr {id}</h1>
            <button className="back-button" onClick={() => navigate('/learn')}>Wróć</button>
        </div>
      );
  }

  // --- RENDEROWANIE ---
  return (
    <div className="offline-container">
        <button className="back-button" onClick={() => navigate('/learn')}>&#8592; Wróć do Lekcji</button>

        {/* --- OKNO INSTRUKTORA --- */}
        <div style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: isWrongAction ? 'rgba(100, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            border: isWrongAction ? '2px solid red' : '2px solid gold',
            borderRadius: '15px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            maxWidth: '600px',
            boxShadow: '0 0 20px rgba(0,0,0,0.8)'
        }}>
            <div style={{ fontSize: '3rem' }}>
                {avatarPose === "A" && "👨‍🏫"} 
                {avatarPose === "B" && "😎"}
                {avatarPose === "C" && "😱"}
            </div>
            <div>
                {/* Tytuł zależny od fazy */}
                <h3 style={{color: 'gold', margin: 0}}>
                    {lessonPhase === 'INTRO' && "Wstęp"}
                    {lessonPhase === 'GAME' && scenario && scenario.title}
                    {lessonPhase === 'CONCLUSION' && "Podsumowanie"}
                </h3>
                
                <p style={{color: 'white', fontSize: '1.1rem', margin: '10px 0'}}>{feedbackText}</p>
                
                {/* PRZYCISKI STEROWANIA LEKCJĄ */}
                
                {lessonPhase === 'INTRO' && (
                    <button onClick={startLesson} style={nextBtnStyle}>
                        ROZPOCZNIJ LEKCJĘ &gt;&gt;
                    </button>
                )}

                {lessonPhase === 'GAME' && isScenarioFinished && (
                    <button onClick={nextStep} style={nextBtnStyle}>
                        NASTĘPNE WYZWANIE &gt;&gt;
                    </button>
                )}

                {lessonPhase === 'CONCLUSION' && (
                    <button onClick={() => navigate('/learn')} style={nextBtnStyle}>
                        ZAKOŃCZ LEKCJĘ (MENU)
                    </button>
                )}
            </div>
        </div>

        {/* --- STÓŁ (Wyświetlamy zawsze, ale w INTRO może być pusty) --- */}
        <div className="game-table-area">
            <img src={tableImage} alt="Stół do gry" className="game-table-image" />

            {/* Renderowanie kart tylko w fazie GAME */}
            {lessonPhase === 'GAME' && (
                <>
                    {dealerCards.map((card, index) => {
                        const isFaceDown = index === 1 && !isScenarioFinished; 
                        const finalLeft = 46 + index * 3;
                        return (
                            <motion.div
                                key={`dealer-${index}`}
                                className="card-image dealer-card"
                                style={{ left: `${finalLeft}%` }}
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <img src={isFaceDown ? reverseCardImage : card.src} alt={card.name} style={{ width: '100%', borderRadius: '4px' }} />
                            </motion.div>
                        );
                    })}

                    {playerCards.map((card, index) => {
                        const finalLeft = hasSplit ? (40 + index * 3) : (46 + index * 3);
                        return (
                            <motion.img 
                                key={`player-${index}`}
                                src={card.src} 
                                className="card-image player-card" 
                                style={{ left: `${finalLeft}%` }} 
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                            />
                        );
                    })}

                    {hasSplit && splitCards.map((card, index) => {
                        const finalLeft = (52 + index * 3);
                        return (
                            <motion.img 
                                key={`split-${index}`}
                                src={card.src} 
                                className="card-image player-card" 
                                style={{ left: `${finalLeft}%` }} 
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                            />
                        );
                    })}
                </>
            )}
        </div>

        {/* PRZYCISKI AKCJI (Tylko w fazie gry i gdy scenariusz trwa) */}
        {lessonPhase === 'GAME' && (
            <div className="game-actions">
                <button className="action-button stand" onClick={() => handleAction('STAND')}>Stand</button>
                <button className="action-button hit" onClick={() => handleAction('HIT')}>Hit</button>
                <button className="action-button double" onClick={() => handleAction('DOUBLE')}>Double</button>
                <button className="action-button split" onClick={() => handleAction('SPLIT')}>Split</button>
            </div>
        )}
    </div>
  );
};

// Styl dla przycisku "Dalej"
const nextBtnStyle = {
    background: 'gold', 
    color: 'black', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '5px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    marginTop: '10px'
};

export default LessonPage;