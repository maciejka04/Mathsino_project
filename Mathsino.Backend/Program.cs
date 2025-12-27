using Mathsino.Backend.Endpoints;
using Mathsino.Backend.Infrastructure;
using Mathsino.Backend.Interfaces;
using Mathsino.Backend.Models;
using Mathsino.Backend.Services;
using Microsoft.EntityFrameworkCore;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
var builder = WebApplication.CreateBuilder(args);

builder.AddAuthServices();

builder.AddServiceDefaults();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Konfiguracja CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReactApp",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});

// Konfiguracja kontekstu bazy danych z odczytem Connection String (sprawdzamy mathsino-db)
builder.Services.AddDbContextPool<MathsinoContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
            ?? builder.Configuration.GetConnectionString("mathsino-db")
    )
);

builder.Services.AddScoped<IBalanceService, BalanceService>();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IUserNameService, UserNameService>();
builder.Services.AddScoped<IUsersService, UsersService>();

var app = builder.Build();

app.UseCors("AllowReactApp");

app.UseSwagger();
app.UseSwaggerUI();

DbMigrator.MigrateDatabase(app);

app.MapAuthEndPoints();
app.MapUserEndPoints();
app.MapGameEndPoints();
app.MapBalanceEndPoints();
app.MapFriendEndPoints();

await app.RunAsync();
