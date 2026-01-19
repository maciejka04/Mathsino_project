using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Mathsino.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UserName = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProviderId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AvatarPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Balance = table.Column<int>(type: "integer", nullable: false),
                    LastSpinTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Language = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    MusicId = table.Column<int>(type: "integer", nullable: false),
                    MusicEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SoundEffectsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LessonsCompleted = table.Column<int>(type: "integer", nullable: false),
                    SpinWheelCount = table.Column<int>(type: "integer", nullable: false),
                    DoubleDownWins = table.Column<int>(type: "integer", nullable: false),
                    ClaimedAchievements = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AdViews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    VerificationToken = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    RewardClaimed = table.Column<bool>(type: "boolean", nullable: false),
                    RewardClaimedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    RewardAmount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdViews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SingleGames",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GameId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    BetAmount = table.Column<int>(type: "integer", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    SingleGameResult = table.Column<int>(type: "integer", nullable: true),
                    SingleGameSplitResult = table.Column<int>(type: "integer", nullable: true),
                    BalanceAfterGame = table.Column<int>(type: "integer", nullable: false),
                    GameStateJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SingleGames", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SingleGames_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserFriends",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    FriendId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFriends", x => new { x.UserId, x.FriendId });
                    table.ForeignKey(
                        name: "FK_UserFriends_Users_FriendId",
                        column: x => x.FriendId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserFriends_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarPath", "Balance", "ClaimedAchievements", "DoubleDownWins", "Email", "FirstName", "Language", "LastName", "LastSpinTime", "LessonsCompleted", "MusicEnabled", "MusicId", "Provider", "ProviderId", "SoundEffectsEnabled", "SpinWheelCount", "UserName" },
                values: new object[,]
                {
                    { 1, "snake.png", 5000, "", 0, "alice.smith@example.com", "Alice", "en", "Smith", new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), 0, true, 1, "", "", true, 0, "alismi" },
                    { 2, "mouse.png", 3000, "", 0, "bob.johnson@example.com", "Bob", "en", "Johnson", new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), 0, true, 1, "", "", true, 0, "bobjoh" }
                });

            migrationBuilder.InsertData(
                table: "UserFriends",
                columns: new[] { "FriendId", "UserId", "Status" },
                values: new object[] { 2, 1, 1 });

            migrationBuilder.CreateIndex(
                name: "IX_AdViews_UserId",
                table: "AdViews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SingleGames_UserId",
                table: "SingleGames",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserFriends_FriendId",
                table: "UserFriends",
                column: "FriendId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdViews");

            migrationBuilder.DropTable(
                name: "SingleGames");

            migrationBuilder.DropTable(
                name: "UserFriends");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
