using Mathsino.Backend.Models;

namespace Mathsino.Backend.Interfaces;

public interface IAchievementService
{
    /// <summary>
    /// Returns list of achievements with current progress and status for user.
    /// </summary>
    Task<List<UserAchievementDto>> GetUserAchievementsAsync(int userId);

    /// <summary>
    /// Marks achievement as claimed and applies reward if eligible.
    /// </summary>
    Task ClaimAchievementRewardAsync(int userId, int achievementId);
}
