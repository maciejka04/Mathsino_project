using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Infrastructure;

public class DbMigrator
{
    public static void MigrateDatabase(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MathsinoContext>();

        var hasMigrations = db.Database.GetMigrations().Any();
        if (!hasMigrations)
        {
            // No migrations defined in assembly – fallback to EnsureCreated
            db.Database.EnsureCreated();
            return;
        }

        try
        {
            db.Database.Migrate();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("PendingModelChangesWarning"))
        {
            // Model changed but no new migration yet – dev-mode reset
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();
        }
    }
}
