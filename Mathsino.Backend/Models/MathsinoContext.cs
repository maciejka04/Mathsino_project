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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserFriend>().HasKey(uf => new { uf.UserId, uf.FriendId });

        modelBuilder
            .Entity<UserFriend>()
            .HasOne(uf => uf.User)
            .WithMany(u => u.Friends)
            .HasForeignKey(uf => uf.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<UserFriend>()
            .HasOne(uf => uf.Friend)
            .WithMany()
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
                    Email = "alice.smith@example.com",
                    Balance = 5000,
                    AvatarPath = "snake.png",
                    Language = "en",
                },
                new User
                {
                    Id = 2,
                    FirstName = "Bob",
                    LastName = "Johnson",
                    Email = "bob.johnson@example.com",
                    Balance = 3000,
                    AvatarPath = "mouse.png",
                    Language = "en",
                }
            );
        modelBuilder
            .Entity<UserFriend>()
            .HasData(
                new UserFriend { UserId = 1, FriendId = 2 },
                new UserFriend { UserId = 2, FriendId = 1 }
            );
    }
}
