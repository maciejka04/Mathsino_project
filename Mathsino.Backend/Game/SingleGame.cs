using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mathsino.Backend.Game
{
    public sealed class SingleGame
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public Guid GameId { get; set; }

        public int UserId { get; set; }

        public Guid PlayerId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public GameResult? SingleGameResult { get; set; } = null;

        public int BalanceAfterGame { get; set; }
    }
}
