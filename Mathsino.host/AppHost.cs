using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var pgUser = builder.AddParameter("pg-username", "postgres");
var pgPassword = builder.AddParameter("pg-password", "test");

var postgres = builder
    .AddPostgres("postgres", pgUser, pgPassword)
    .WithPgAdmin(pgAdmin => pgAdmin.WithHostPort(5050))
    .WithDataBindMount(source: "postgres-data");

var postgresDb = postgres.AddDatabase("mathsino-db");

var backend = builder
    .AddProject<Mathsino_Backend>("backend")
    .WithReference(postgresDb)
    .WaitFor(postgresDb)
    .WaitFor(postgres);

builder
    .AddNpmApp(name: "reactfrontend", workingDirectory: "../mathsino.reactfrontend")
    .WithReference(backend)
    .WaitFor(backend)
    .WithHttpEndpoint(targetPort: 3000, name: "react-http");

await builder.Build().RunAsync();
