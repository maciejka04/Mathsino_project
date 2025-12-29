using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mathsino.Backend.Models
{
    public class AdView
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int UserId { get; set; }

        [MaxLength(64)]
        public string VerificationToken { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool RewardClaimed { get; set; } = false;

        public DateTime? RewardClaimedAt { get; set; }

        public int RewardAmount { get; set; } = 100;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}

public record StartAdViewResponse(string Token, DateTime ExpiresAt, int RewardAmount);

public record ClaimAdRewardRequest(string Token);

public record ClaimAdRewardResponse(int Balance, int RewardAmount);
