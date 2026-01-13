using Mathsino.Backend.Game;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Models;

#pragma warning disable S2325

public class MathsinoContext : DbContext
{
    public MathsinoContext(DbContextOptions<MathsinoContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserFriend> UserFriends => Set<UserFriend>();

    public DbSet<SingleGame> SingleGames => Set<SingleGame>();

    public DbSet<AdView> AdViews { get; set; }

    private static readonly DateTime StaticPastSpinTime = new(
        2025,
        1,
        1,
        10,
        0,
        0,
        DateTimeKind.Utc
    );

    [Obsolete]
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserFriend>().HasKey(uf => new { uf.UserId, uf.FriendId });

        modelBuilder
            .Entity<UserFriend>()
            .HasOne(uf => uf.User)
            .WithMany(u => u.SentFriendRequests)
            .HasForeignKey(uf => uf.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<UserFriend>()
            .HasOne(uf => uf.Friend)
            .WithMany(u => u.ReceivedFriendRequests)
            .HasForeignKey(uf => uf.FriendId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<User>()
            .HasData(
                new User
                {
                    Id = 1,
                    FirstName = "Alice",
                    LastName = "Smith",
                    UserName = "alismi",
                    Email = "alice.smith@example.com",
                    Balance = 5000,
                    AvatarPath = "snake.png",
                    Language = "en",
                    LastSpinTime = StaticPastSpinTime,
                    LessonsCompleted = 0,
                },
                new User
                {
                    Id = 2,
                    FirstName = "Bob",
                    LastName = "Johnson",
                    UserName = "bobjoh",
                    Email = "bob.johnson@example.com",
                    Balance = 3000,
                    AvatarPath = "mouse.png",
                    Language = "en",
                    LastSpinTime = StaticPastSpinTime,
                    LessonsCompleted = 0,
                }
            );
        modelBuilder
            .Entity<UserFriend>()
            .HasData(
                new UserFriend
                {
                    UserId = 1,
                    FriendId = 2,
                    Status = FriendStatus.Accepted,
                }
            );
    }
}
