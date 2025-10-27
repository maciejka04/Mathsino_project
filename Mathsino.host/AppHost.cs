using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var backend = builder.AddProject<Mathsino_Backend>("backend");
var frontend = builder
    .AddProject<Mathsino_Frontend>("frontend")
    .WithReference(backend)
    .WaitFor(backend);

builder.Build().Run();
