using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mathsino.Backend.Models;

public class User
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [StringLength(20)]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(20)]
    public string LastName { get; set; } = string.Empty;

    [StringLength(20)]
    public string UserName { get; set; } = string.Empty;

    [StringLength(50), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [StringLength(50)]
    public string Provider { get; set; } = string.Empty;

    [StringLength(100)]
    public string ProviderId { get; set; } = string.Empty;

    // ---------------------------
    [StringLength(255)]
    public string AvatarPath { get; set; } = "snake.png";

    public List<UserFriend> SentFriendRequests { get; set; } = [];

    public List<UserFriend> ReceivedFriendRequests { get; set; } = [];

    public int Balance { get; set; } = 0;

    [Column(TypeName = "timestamp with time zone")] 
    public DateTime? LastSpinTime { get; set; } = null;

    [StringLength(5)]
    public string Language { get; set; } = "en";

    public int MusicId { get; set; } = 1;

    public bool MusicEnabled { get; set; } = true;

    public bool SoundEffectsEnabled { get; set; } = true;

    public int LessonsCompleted { get; set; } = 0;

    public int SpinWheelCount { get; set; } = 0; 
    public int DoubleDownWins { get; set; } = 0;
}

public class UserFriend
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int FriendId { get; set; }
    public User Friend { get; set; } = null!;

    public FriendStatus Status { get; set; }
}

public record FriendDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    int Balance,
    string AvatarPath
);

public record UserDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    List<FriendDto> Friends,
    int Balance,
    string Language,
    int MusicId,
    bool MusicEnabled,
    bool SoundEffectsEnabled,
    int LessonsCompleted,
    int SpinWheelCount,
    int DoubleDownWins,
    DateTime? LastSpinTime
);

public record UpdateAvatarRequest(string AvatarPath);
