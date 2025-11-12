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

app.MapGet(
    "/users",
    async (MathsinoContext db) =>
    {
        var users = await db
            .Users.Include(u => u.Friends)
            .ThenInclude(uf => uf.Friend)
            .Select(u => new UserDto(
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.Friends.Select(f => new FriendDto(
                        f.Friend.Id,
                        f.Friend.FirstName,
                        f.Friend.LastName,
                        f.Friend.Email
                    ))
                    .ToList()
            ))
            .ToListAsync();

        return Results.Ok(users);
    }
);

app.MapGet(
    "/users/{id}",
    async (int id, MathsinoContext db) =>
    {
        var user = await db
            .Users.Include(u => u.Friends)
            .ThenInclude(uf => uf.Friend)
            .Where(u => u.Id == id)
            .Select(u => new UserDto(
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.Friends.Select(f => new FriendDto(
                        f.Friend.Id,
                        f.Friend.FirstName,
                        f.Friend.LastName,
                        f.Friend.Email
                    ))
                    .ToList()
            ))
            .FirstOrDefaultAsync();

        return user is not null ? Results.Ok(user) : Results.NotFound();
    }
);

await app.RunAsync();

static void MigrateDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<MathsinoContext>();
    db.Database.Migrate();
}
