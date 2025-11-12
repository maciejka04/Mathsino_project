using Mathsino.Backend.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContextPool<MathsinoContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("mathsino-db"))
);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

MigrateDatabase(app);

app.MapGet("/", () => "Mathsino Backend is running!");

app.MapGet("/users", async (MathsinoContext db) => await db.Users.ToListAsync());

await app.RunAsync();

static void MigrateDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
    db.Database.Migrate();
}
