namespace Mathsino.Backend.Models;

public record UserAchievementDto(
    int Id,
    string Title,
    int Progress,
    int Target,
    int Status,
    RewardType RewardType,
    int RewardValue,
    string? RewardLabel
);
