using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Mathsino.Backend.Infrastructure;

public class DbMigrator
{
    public static void MigrateDatabase(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
        db.Database.Migrate();
    }
}
