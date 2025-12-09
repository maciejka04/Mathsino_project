using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mathsino.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMusicIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MusicId",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MusicId",
                table: "Users");
        }
    }
}
