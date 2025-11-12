using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var backend = builder.AddProject<Mathsino_Backend>("backend");

builder
    .AddNpmApp(name: "reactfrontend", workingDirectory: "../mathsino.reactfrontend")
    .WithReference(backend)
    .WithHttpEndpoint(targetPort: 3000, name: "react-http");

builder.Build().Run();
