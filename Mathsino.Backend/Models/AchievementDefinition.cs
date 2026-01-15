namespace Mathsino.Backend.Models;

public enum RewardType
{
    Cash,
    Avatar
}

public record AchievementDefinition(
    int Id,
    string Title,
    string? StatKey,
    int TargetValue,
    RewardType RewardType,
    int RewardValue,
    string? RewardLabel
)
{
    public static readonly IReadOnlyList<AchievementDefinition> All = new List<AchievementDefinition>
    {
        new(1, "The Journey Begins", null, 1, RewardType.Avatar, 0, "avatar_student"),
        new(2, "Master of Strategy", "LessonsCompleted", 10, RewardType.Cash, 1000, null),
        new(3, "In the Green", "PeakBalance", 3000, RewardType.Cash, 500, null),
        new(4, "Stacking Chips", "PeakBalance", 7000, RewardType.Cash, 1000, null),
        new(5, "High Roller", "PeakBalance", 10000, RewardType.Avatar, 0, "avatar_vip"),
        new(6, "Casino Whale", "PeakBalance", 20000, RewardType.Avatar, 0, "avatar_rich"),
        new(7, "The King", "PeakBalance", 100000, RewardType.Avatar, 0, "avatar_king"),
        new(8, "Daily Regular", "DaysStreak", 10, RewardType.Cash, 2000, null),
        new(9, "Fortune Seeker", "SpinWheelCount", 25, RewardType.Avatar, 0, "avatar_crazy"),
        new(10, "Friendly Face", "FriendsCount", 3, RewardType.Cash, 500, null),
        new(11, "Card Veteran", "GamesPlayed", 100, RewardType.Avatar, 0, "avatar_veteran"),
        new(12, "Table Regular", "GamesPlayed", 1000, RewardType.Cash, 5000, null),
        new(13, "Living Legend", "GamesPlayed", 10000, RewardType.Avatar, 0, "avatar_cyborg"),
        new(14, "Natural 21", "BlackJacks", 1, RewardType.Cash, 200, null),
        new(15, "Blackjack Pro", "BlackJacks", 10, RewardType.Avatar, 0, "avatar_ace"),
        new(16, "Double Trouble", "DoubleDownWins", 5, RewardType.Avatar, 0, "avatar_risk")
    };
}
