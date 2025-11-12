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

    [StringLength(50), EmailAddress]
    public string Email { get; set; } = string.Empty;

    public List<UserFriend> Friends { get; set; } = [];
}

public class UserFriend
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int FriendId { get; set; }
    public User Friend { get; set; } = null!;
}
