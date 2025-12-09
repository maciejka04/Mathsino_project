using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mathsino.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarPathAndLanguageToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarPath",
                table: "Users",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "snake.png");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarPath",
                table: "Users");

        }
    }
}
