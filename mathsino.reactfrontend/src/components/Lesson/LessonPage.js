import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // IMPORT I18N
import audioService from '../../services/audioService';

// --- STYLES & ASSETS ---
import '../Offline/Offline.css'; 
import './LessonPage.css';
import tableImage from '../../assets/table4.png';
import reverseCardImage from '../../assets/karty/reverse.png';

// --- AVATARS ---
import avatarImgA from '../../assets/parrot-teacher.png'; 
import avatarImgB from '../../assets/parrot-teacher-happy.png'; 
import avatarImgC from '../../assets/parrot-teacher-thinking.png';

// --- SOUNDS ---
import lesson1snd from '../../assets/lesson1.mp3';
import lesson2snd from '../../assets/lesson2.mp3';
import lesson3snd from '../../assets/lesson3.mp3';
import lesson4snd from '../../assets/lesson4.mp3';
import lesson5snd from '../../assets/lesson5.mp3';
import lesson6snd from '../../assets/lesson6.mp3';
import lesson7snd from '../../assets/lesson7.mp3';
import lesson8snd from '../../assets/lesson8.mp3';
import lesson9snd from '../../assets/lesson9.mp3';

// UWAGA: Usunęliśmy statyczne importy lesson1.json, lesson2.json itd.
// Będą one ładowane dynamicznie.

const lessonSoundMap = {
  1: lesson1snd, 2: lesson2snd, 3: lesson3snd, 4: lesson4snd, 
  5: lesson5snd, 6: lesson6snd, 7: lesson7snd, 8: lesson8snd, 9: lesson9snd
};

const avatarMap = { "A": avatarImgA, "B": avatarImgB, "C": avatarImgC };

// --- CARD HELPERS ---
const allCardFileNames = [
    '2_of_hearts', '3_of_hearts', '4_of_hearts', '5_of_hearts', '6_of_hearts', '7_of_hearts', '8_of_hearts', '9_of_hearts', '10_of_hearts', 'jack_of_hearts', 'queen_of_hearts', 'king_of_hearts', 'ace_of_hearts',
    '2_of_diamonds', '3_of_diamonds', '4_of_diamonds', '5_of_diamonds', '6_of_diamonds', '7_of_diamonds', '8_of_diamonds', '9_of_diamonds', '10_of_diamonds', 'jack_of_diamonds', 'queen_of_diamonds', 'king_of_diamonds', 'ace_of_diamonds',
    '2_of_clubs', '3_of_clubs', '4_of_clubs', '5_of_clubs', '6_of_clubs', '7_of_clubs', '8_of_clubs', '9_of_clubs', '10_of_clubs', 'jack_of_clubs', 'queen_of_clubs', 'king_of_clubs', 'ace_of_clubs',
    '2_of_spades', '3_of_spades', '4_of_spades', '5_of_spades', '6_of_spades', '7_of_spades', '8_of_spades', '9_of_spades', '10_of_spades', 'jack_of_spades', 'queen_of_spades', 'king_of_spades', 'ace_of_spades'
];

const cardImagesMap = allCardFileNames.reduce((acc, cardName) => {
    try { acc[cardName] = require(`../../assets/karty/${cardName}.png`); } catch (e) {}
    return acc;
}, {});

const mapJsonCardToFilename = (jsonValue) => {
    if (!jsonValue) return null;
    if (!jsonValue.includes('_')) {
         let rank = jsonValue.toLowerCase();
         if (rank === 'a') rank = 'ace';
         if (rank === 'k') rank = 'king';
         if (rank === 'q') rank = 'queen';
         if (rank === 'j') rank = 'jack';
         return `${rank}_of_spades`;
    }
    return jsonValue;
};

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation(); // HOOK DO JĘZYKA

  // Stan na dane lekcji (ładowane dynamicznie)
  const [currentLessonData, setCurrentLessonData] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(true);

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

  const scenario = currentLessonData ? currentLessonData.scenarios[currentScenarioIndex] : null;

  // --- 0. DYNAMICZNE ŁADOWANIE LEKCJI ---
  useEffect(() => {
    const loadLessonFile = async () => {
        setLoadingLesson(true);
        try {
            // Pobieramy język ('pl' lub 'en'). Domyślnie 'en'.
            const lang = (i18n.language || 'en').substring(0, 2); 
            
            // Dynamiczny import: assets/lekcje/{lang}/lekcja{id}.json
            const module = await import(`../../assets/lekcje/${lang}/lekcja${id}.json`);
            
            setCurrentLessonData(module.default || module);
        } catch (error) {
            console.error("Błąd ładowania lekcji:", error);
            // Fallback do EN, jeśli PL nie działa
            try {
                const fallback = await import(`../../assets/lekcje/en/lekcja${id}.json`);
                setCurrentLessonData(fallback.default || fallback);
            } catch(e) {
                // Lekcja nie istnieje w ogóle
                setCurrentLessonData(null);
            }
        } finally {
            setLoadingLesson(false);
        }
    };

    loadLessonFile();
  }, [id, i18n.language]); // Przeładuj, gdy zmieni się ID lub Język

  // --- 1. SETUP ON LESSON LOADED ---
  useEffect(() => {
    if (currentLessonData) {
        // Dźwięk przy pierwszym załadowaniu lekcji
        audioService.playSoundEffect(lessonSoundMap[id]);

        setLessonPhase('INTRO');
        setCurrentScenarioIndex(0);
        setCurrentStepIndex(0);
        setDealerCards([]);
        setPlayerCards([]);
        setSplitCards([]);
        
        if (currentLessonData.introduction) {
            setFeedbackText(currentLessonData.introduction.text);
            setAvatarPose(currentLessonData.introduction.avatar_pose);
        }
    }
  }, [currentLessonData, id]);

  // --- 2. SETUP SCENARIO (GAME PHASE ONLY) ---
  useEffect(() => {
    if (lessonPhase === 'GAME' && scenario) {
      setHasSplit(false);
      setSplitCards([]);
      setIsScenarioFinished(false);
      setIsWrongAction(false);
      
      const pCards = scenario.setup.player_hand.map(code => ({
          name: code, src: cardImagesMap[mapJsonCardToFilename(code)]
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
  }, [lessonPhase, currentScenarioIndex, scenario]);

  // --- ACTIONS ---
  const startLesson = () => setLessonPhase('GAME');

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

      if (currentStep.cards_added_to_split && currentStep.cards_added_to_split.length > 0) {
         const newSplitCards = currentStep.cards_added_to_split.map(code => ({
            name: code,
            src: cardImagesMap[mapJsonCardToFilename(code)]
         }));
         setSplitCards(prev => [...prev, ...newSplitCards]);
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
      setFeedbackText("Nope! That's not the best move here. Try something else!");
      // Możesz też dodać tłumaczenie tutaj: t('lesson_wrong_move')
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
                name: code, src: cardImagesMap[mapJsonCardToFilename(code)]
             }));
             return [...newCards, ...extraCards];
        }
        return newCards;
    });
  };

  const nextStep = () => {
    if (currentScenarioIndex + 1 < currentLessonData.scenarios.length) {
      setCurrentScenarioIndex(prev => prev + 1);
    } else {
      setLessonPhase('CONCLUSION');
      if (currentLessonData.conclusion) {
          setFeedbackText(currentLessonData.conclusion.text);
          setAvatarPose(currentLessonData.conclusion.avatar_pose);
          setDealerCards([]);
          setPlayerCards([]);
          setSplitCards([]);
      }
    }
  };

  // --- RENDEROWANIE ---
  if (loadingLesson) {
      return <div className="offline-container"><h1 style={{color:'white'}}>Loading Lesson...</h1></div>;
  }

  if (!currentLessonData) {
      return (
        <div className="offline-container">
            <h1 style={{color: 'white'}}>Lesson {id} not found</h1>
            <button className="back-button" onClick={() => navigate('/learn')}>Go Back</button>
        </div>
      );
  }

  return (
    <div className="offline-container">
        <button className="back-button" onClick={() => navigate('/learn')}>&#8592; Exit Lesson</button>

        <div className="game-table-area">
            <img src={tableImage} alt="Game Table" className="game-table-image" />

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

        <div className="instructor-wrapper">
            <div className="speech-bubble">
                <h3 className="bubble-title">
                    {lessonPhase === 'INTRO' && "Introduction"}
                    {lessonPhase === 'GAME' && scenario && scenario.title}
                    {lessonPhase === 'CONCLUSION' && "Conclusion"}
                </h3>
                
                <p className="bubble-text">{feedbackText}</p>

                {lessonPhase === 'INTRO' && (
                    <button onClick={startLesson} className="bubble-btn">
                        START LESSON
                    </button>
                )}

                {lessonPhase === 'GAME' && isScenarioFinished && (
                    <button onClick={nextStep} className="bubble-btn">
                        NEXT CHALLENGE
                    </button>
                )}

                {lessonPhase === 'CONCLUSION' && (
                    <button onClick={() => navigate('/learn')} className="bubble-btn menu">
                        BACK TO MENU
                    </button>
                )}
            </div>

            <motion.img 
                key={avatarPose}
                src={avatarMap[avatarPose] || avatarMap['A']} 
                alt="Instructor" 
                className="instructor-avatar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            />
        </div>

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

export default LessonPage;