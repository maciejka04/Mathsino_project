using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mathsino.Backend.Models;

namespace Mathsino.Backend.Game
{
    public sealed class SingleGame
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public Guid GameId { get; set; }

        public int UserId { get; set; }

        public int BetAmount { get; set; } = 0;

        public Guid PlayerId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public GameResult? SingleGameResult { get; set; } = null;
        public GameResult? SingleGameSplitResult { get; set; } = null;
        public bool HasSplit => SingleGameSplitResult != null;
        public int BalanceAfterGame { get; set; }

        [ForeignKey("UserId")]
        public User? Player { get; set; }
    }

    public record SingleGameDto(
        int Id,
        Guid GameId,
        int UserId,
        Guid PlayerId,
        DateTime StartTime,
        DateTime EndTime,
        GameResult? SingleGameResult,
        GameResult? SingleGameSplitResult,
        int BalanceAfterGame
    );
}
