
const allCardFileNames = [
  "2_of_hearts", "3_of_hearts", "4_of_hearts", "5_of_hearts", "6_of_hearts", "7_of_hearts", "8_of_hearts", "9_of_hearts", "10_of_hearts", "jack_of_hearts", "queen_of_hearts", "king_of_hearts", "ace_of_hearts",
  "2_of_diamonds", "3_of_diamonds", "4_of_diamonds", "5_of_diamonds", "6_of_diamonds", "7_of_diamonds", "8_of_diamonds", "9_of_diamonds", "10_of_diamonds", "jack_of_diamonds", "queen_of_diamonds", "king_of_diamonds", "ace_of_diamonds",
  "2_of_clubs", "3_of_clubs", "4_of_clubs", "5_of_clubs", "6_of_clubs", "7_of_clubs", "8_of_clubs", "9_of_clubs", "10_of_clubs", "jack_of_clubs", "queen_of_clubs", "king_of_clubs", "ace_of_clubs",
  "2_of_spades", "3_of_spades", "4_of_spades", "5_of_spades", "6_of_spades", "7_of_spades", "8_of_spades", "9_of_spades", "10_of_spades", "jack_of_spades", "queen_of_spades", "king_of_spades", "ace_of_spades",
];

export const cardImagesMap = allCardFileNames.reduce((acc, cardName) => {
  try {
    acc[cardName] = require(`../../../assets/karty/${cardName}.png`);
  } catch (e) { }
  return acc;
}, {});

export const getCardProp = (card, prop) => {
  if (!card) return null;
  return (
    card[prop.toLowerCase()] ||
    card[prop.charAt(0).toUpperCase() + prop.slice(1)]
  );
};

export const mapBackendCardToFilename = (card) => {
  if (!card) return null;
  let rankName = (getCardProp(card, "rank") || "").toLowerCase();
  if (rankName === "a") rankName = "ace";
  else if (rankName === "k") rankName = "king";
  else if (rankName === "q") rankName = "queen";
  else if (rankName === "j") rankName = "jack";
  const suitName = (getCardProp(card, "suit") || "").toLowerCase();
  return `${rankName}_of_${suitName}`;
};

export const calculateHandValue = (hand) => {
  let sum = 0;
  let numAces = 0;

  for (const card of hand) {
    if (!card || !card.name) continue;

    const rank = card.name.split('_of_')[0].toLowerCase();

    if (rank === 'ace') {
      numAces += 1;
      sum += 11;
    } else if (['king', 'queen', 'jack', '10'].includes(rank)) {
      sum += 10;
    } else {
      const numericalRank = parseInt(rank, 10);
      if (!isNaN(numericalRank)) {
        sum += numericalRank;
      }
    }
  }

  // Korekta dla Asów
  while (sum > 21 && numAces > 0) {
    sum -= 10;
    numAces -= 1;
  }

  return sum;
};