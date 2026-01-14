// src/components/Achievements/achievementsConfig.js

// Tutaj w przyszłości podmienisz 'path_to_image' na importy prawdziwych awatarów
import avatarDefault from '../../assets/parrot-teacher.png'; 
// import avatarVip from '../../assets/avatars/vip.png'; // Przykład

export const achievementsConfig = [
    {
        id: 1,
        title: "The Journey Begins",
        description: "Complete Lesson 1, Win 1 game, Play 5 games, Spin the wheel once.",
        targetValue: 1, // To jest złożone, w logice potraktujemy to jako boolean (czy odblokowane)
        rewardType: "AVATAR",
        rewardValue: "avatar_student", // ID awatara w bazie
        rewardLabel: "Student Avatar",
        icon: "fa-solid fa-graduation-cap"
    },
    {
        id: 2,
        title: "Master of Strategy",
        description: "Complete all lessons.",
        targetValue: 10, // Zakładamy 10 lekcji
        statKey: "lessonsCompleted", // Klucz w obiekcie user (do zrobienia w backendzie)
        rewardType: "CASH",
        rewardValue: 1000,
        icon: "fa-solid fa-brain"
    },
    {
        id: 3,
        title: "In the Green",
        description: "Reach a balance of 3,000 PLN.",
        targetValue: 3000,
        statKey: "maxBalance", // Najwyższe saldo kiedykolwiek
        rewardType: "CASH",
        rewardValue: 500,
        icon: "fa-solid fa-money-bill-wave"
    },
    {
        id: 4,
        title: "Stacking Chips",
        description: "Reach a balance of 7,000 PLN.",
        targetValue: 7000,
        statKey: "maxBalance",
        rewardType: "CASH",
        rewardValue: 1000,
        icon: "fa-solid fa-layer-group"
    },
    {
        id: 5,
        title: "High Roller",
        description: "Reach a balance of 10,000 PLN.",
        targetValue: 10000,
        statKey: "maxBalance",
        rewardType: "AVATAR",
        rewardValue: "avatar_vip",
        rewardLabel: "VIP Avatar",
        icon: "fa-solid fa-crown"
    },
    {
        id: 6,
        title: "Casino Whale",
        description: "Reach a balance of 20,000 PLN.",
        targetValue: 20000,
        statKey: "maxBalance",
        rewardType: "AVATAR",
        rewardValue: "avatar_rich",
        rewardLabel: "Rich Avatar",
        icon: "fa-solid fa-gem"
    },
    {
        id: 7,
        title: "The King",
        description: "Reach a balance of 100,000 PLN.",
        targetValue: 100000,
        statKey: "maxBalance",
        rewardType: "AVATAR",
        rewardValue: "avatar_king",
        rewardLabel: "King Avatar",
        icon: "fa-solid fa-chess-king"
    },
    {
        id: 8,
        title: "Daily Regular",
        description: "Play 10 days in a row.",
        targetValue: 10,
        statKey: "loginStreak",
        rewardType: "CASH",
        rewardValue: 2000,
        icon: "fa-solid fa-calendar-check"
    },
    {
        id: 9,
        title: "Fortune Seeker",
        description: "Spin the Lucky Wheel 25 times.",
        targetValue: 25,
        statKey: "spinWheelCount",
        rewardType: "AVATAR",
        rewardValue: "avatar_crazy",
        rewardLabel: "Crazy Avatar",
        icon: "fa-solid fa-arrows-spin"
    },
    {
        id: 10,
        title: "Friendly Face",
        description: "Add 3 friends.",
        targetValue: 3,
        statKey: "friendsCount",
        rewardType: "CASH",
        rewardValue: 500,
        icon: "fa-solid fa-user-group"
    },
    {
        id: 11,
        title: "Card Veteran",
        description: "Play 100 hands.",
        targetValue: 100,
        statKey: "gamesPlayed",
        rewardType: "AVATAR",
        rewardValue: "avatar_veteran",
        rewardLabel: "Veteran Avatar",
        icon: "fa-solid fa-id-card"
    },
    {
        id: 12,
        title: "Table Regular",
        description: "Play 1,000 hands.",
        targetValue: 1000,
        statKey: "gamesPlayed",
        rewardType: "CASH",
        rewardValue: 5000,
        icon: "fa-solid fa-chair"
    },
    {
        id: 13,
        title: "Living Legend",
        description: "Play 10,000 hands.",
        targetValue: 10000,
        statKey: "gamesPlayed",
        rewardType: "AVATAR",
        rewardValue: "avatar_cyborg",
        rewardLabel: "Cyborg Avatar",
        icon: "fa-solid fa-robot"
    },
    {
        id: 14,
        title: "Natural 21",
        description: "Hit a Blackjack.",
        targetValue: 1,
        statKey: "blackjacksCount",
        rewardType: "CASH",
        rewardValue: 200,
        icon: "fa-solid fa-bolt"
    },
    {
        id: 15,
        title: "Blackjack Pro",
        description: "Hit Blackjack 10 times.",
        targetValue: 10,
        statKey: "blackjacksCount",
        rewardType: "AVATAR",
        rewardValue: "avatar_ace",
        rewardLabel: "Ace Avatar",
        icon: "fa-solid fa-trophy"
    },
    {
        id: 16,
        title: "Double Trouble",
        description: "Win 5 hands after a Double Down.",
        targetValue: 5,
        statKey: "doubleDownWins",
        rewardType: "AVATAR",
        rewardValue: "avatar_risk",
        rewardLabel: "Risk Avatar",
        icon: "fa-solid fa-percent"
    }
];