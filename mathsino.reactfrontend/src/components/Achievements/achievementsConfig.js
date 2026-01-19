export const achievementsConfig = [
    // --- GAMES (1-4) ---
    {
        id: 1,
        title: "Warm Up",
        description: "Play 10 games of Blackjack.",
        icon: "fa-solid fa-play",
        targetValue: 10,
        statKey: "totalGames",
        rewardType: "CASH",
        rewardValue: 50,
        rewardLabel: "50 PLN"
    },
    {
        id: 2,
        title: "Regular",
        description: "Play 100 games.",
        icon: "fa-solid fa-layer-group",
        targetValue: 100,
        statKey: "totalGames",
        rewardType: "CASH",
        rewardValue: 300,
        rewardLabel: "300 PLN"
    },
    {
        id: 3,
        title: "Table Veteran",
        description: "Play 1000 games.",
        icon: "fa-solid fa-chess-king",
        targetValue: 1000,
        statKey: "totalGames",
        rewardType: "CASH",
        rewardValue: 1500,
        rewardLabel: "1500 PLN"
    },
    {
        id: 4,
        title: "Casino Legend",
        description: "Play 10,000 games.",
        icon: "fa-solid fa-crown",
        targetValue: 10000,
        statKey: "totalGames",
        rewardType: "CASH",
        rewardValue: 5000,
        rewardLabel: "5000 PLN"
    },

    // --- PEAK BALANCE (5-8) ---
    {
        id: 5,
        title: "First Savings",
        description: "Reach a peak balance of 3,000 PLN.",
        icon: "fa-solid fa-wallet",
        targetValue: 3000,
        statKey: "peakBalance",
        rewardType: "CASH",
        rewardValue: 200,
        rewardLabel: "200 PLN"
    },
    {
        id: 6,
        title: "Investor",
        description: "Reach a peak balance of 10,000 PLN.",
        icon: "fa-solid fa-briefcase",
        targetValue: 10000,
        statKey: "peakBalance",
        rewardType: "CASH",
        rewardValue: 1000,
        rewardLabel: "1000 PLN"
    },
    {
        id: 7,
        title: "Tycoon",
        description: "Reach a peak balance of 25,000 PLN.",
        icon: "fa-solid fa-money-bill-wave",
        targetValue: 25000,
        statKey: "peakBalance",
        rewardType: "CASH",
        rewardValue: 2500,
        rewardLabel: "2500 PLN"
    },
    {
        id: 8,
        title: "Millionaire (Almost)",
        description: "Reach a peak balance of 100,000 PLN.",
        icon: "fa-solid fa-vault",
        targetValue: 100000,
        statKey: "peakBalance",
        rewardType: "CASH",
        rewardValue: 10000,
        rewardLabel: "10 000 PLN"
    },

    // --- LESSONS (9-10) ---
    {
        id: 9,
        title: "Diligent Student",
        description: "Complete at least one lesson.",
        icon: "fa-solid fa-book-open",
        targetValue: 1,
        statKey: "lessonsCompleted",
        rewardType: "CASH",
        rewardValue: 100,
        rewardLabel: "100 PLN"
    },
    {
        id: 10,
        title: "Strategy Master",
        description: "Complete all lessons (5).",
        icon: "fa-solid fa-graduation-cap",
        targetValue: 10,
        statKey: "lessonsCompleted",
        rewardType: "CASH",
        rewardValue: 1000,
        rewardLabel: "1000 PLN"
    },

    // --- SPIN WHEEL (11-12) ---
    {
        id: 11,
        title: "Lucky Spin",
        description: "Spin the wheel once.",
        icon: "fa-solid fa-dharmachakra",
        targetValue: 1,
        statKey: "spinWheelCount",
        rewardType: "CASH",
        rewardValue: 50,
        rewardLabel: "50 PLN"
    },
    {
        id: 12,
        title: "Gambler",
        description: "Spin the wheel 10 times.",
        icon: "fa-solid fa-arrows-spin",
        targetValue: 10,
        statKey: "spinWheelCount",
        rewardType: "CASH",
        rewardValue: 500,
        rewardLabel: "500 PLN"
    },

    // --- STREAK (13) ---
    {
        id: 13,
        title: "Loyal Player",
        description: "Login 5 days in a row.",
        icon: "fa-solid fa-fire",
        targetValue: 5,
        statKey: "loginStreak",
        rewardType: "CASH",
        rewardValue: 500,
        rewardLabel: "500 PLN"
    },

    // --- SPECIAL (14) - NOWY ---
    {
        id: 14,
        title: "Risk Taker",
        description: "Win 5 games after doubling down.",
        icon: "fa-solid fa-angles-up",
        targetValue: 5,
        statKey: "doubleDownWins",
        rewardType: "CASH",
        rewardValue: 1000,
        rewardLabel: "1000 PLN"
    }
];