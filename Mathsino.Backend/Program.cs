using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContextPool<MathsinoContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("mathsino-db"))
);

builder.Services.AddScoped<UsersService>();
builder.Services.AddSingleton<GameService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

MigrateDatabase(app);

app.MapUserEndPoints();
app.MapGameEndPoints();

await app.RunAsync();

static void MigrateDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
    db.Database.Migrate();
}
