using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mathsino.Backend.Models;

/// <summary>
/// Stores a per-user achievement state.
/// Status values:
/// 0 – not completed
/// 1 – completed, reward not claimed
/// 2 – reward claimed
/// </summary>
public class UserAchievement
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }

    public int AchievementId { get; set; }

    /// <summary>
    /// 0 – not completed, 1 – completed, 2 – reward claimed
    /// </summary>
    public int Status { get; set; } = 0;

    public User User { get; set; } = null!;
}
