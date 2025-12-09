using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mathsino.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAudioSettingsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "MusicEnabled",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "SoundEffectsEnabled",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MusicEnabled", "SoundEffectsEnabled" },
                values: new object[] { true, true });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MusicEnabled", "SoundEffectsEnabled" },
                values: new object[] { true, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MusicEnabled",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SoundEffectsEnabled",
                table: "Users");
        }
    }
}
