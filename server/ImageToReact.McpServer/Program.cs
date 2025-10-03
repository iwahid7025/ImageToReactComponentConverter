using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ModelContextProtocol.Server;
using System.ComponentModel;

var builder = WebApplication.CreateBuilder(args);

// Log to console (useful while testing with MCP clients)
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// 1) Register MCP server + (preview) HTTP/SSE transport + scan for tools in this assembly
builder.Services
    .AddMcpServer()
    // NOTE: The exact extension name may differ as the SDK evolves (preview).
    // In current previews, the AspNetCore package wires HTTP/SSE endpoints and DI.
    // We'll map routes below via middleware.
    .WithToolsFromAssembly();

// 2) Allow your Vite app to call this server during local dev
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

var app = builder.Build();
app.UseCors();

// 3) Map MCP endpoints (HTTP + SSE) for browser clients
//    Streamable HTTP is the MCP standard for web environments.
//    The SDK’s AspNetCore package provides helpers to map the MCP routes.
//    Depending on preview version, you’ll see helpers such as:
//      app.MapMcpSse("/mcp/sse");   // Server-Sent Events stream
//      app.MapMcpHttp("/mcp");      // POST endpoint for JSON-RPC requests
//
// If your current preview exposes a different naming (e.g., MapMcpEndpoints),
// prefer that; the concept is the same: one POST route + one SSE route.
app.MapGet("/", () => "ImageToReact MCP server is running");

// ---- MCP tool test façade (optional convenience) ----
// This is a simple REST endpoint that calls the same code as our tool method.
// It lets your React app fetch() without speaking MCP yet; we keep both paths
// so you can graduate to pure MCP later without changing business logic.
// REST façade endpoint for testing - allows React app to call the tool without MCP protocol.
// In production, clients should use the MCP endpoints for full protocol support.
app.MapPost("/api/image-to-react", async (ImageToReactTool.Input input) =>
{
    // For Step 4, we return a placeholder TSX.
    var result = await ImageToReactTool.ImageToReact(input);
    return Results.Json(new { tsx = result });
});

app.Run();


// ================== MCP TOOL TYPE ==================
/// <summary>
/// MCP tool for converting UI images to React TSX components.
/// Currently returns placeholder components; will integrate OpenAI Vision in future iterations.
/// </summary>
[McpServerToolType]
public static class ImageToReactTool
{
    /// <summary>
    /// Input parameters for the image-to-react conversion tool.
    /// Accepts a base64-encoded image and optional hints for the conversion.
    /// </summary>
    public class Input
    {
        /// <summary>Base64-encoded image data (data URI format supported: data:image/...;base64,...)</summary>
        public required string ImageBase64 { get; set; }

        /// <summary>Optional hints about the desired component style (e.g., "card with title + subtitle")</summary>
        public string? Hints { get; set; }
    }

    /// <summary>
    /// (Step 4 placeholder) Returns a trivial TSX component string.
    /// In Step 5 we'll call OpenAI Vision and return real code.
    /// </summary>
    [McpServerTool, Description("Convert a UI image to a React TSX component (placeholder in Step 4).")]
    public static ValueTask<string> ImageToReact(Input input)
    {
        // Just prove plumbing works; ignore image for now.
        var tsx = """
        import React from "react";

        export default function GeneratedCard() {
          return (
            <div style={{
              borderRadius: 12, padding: 16, border: "1px solid #1f2937",
              background: "#0b1220", color: "#e5e7eb", maxWidth: 420
            }}>
              <h3 style={{ margin: "0 0 8px" }}>Hello from MCP</h3>
              <p style={{ margin: 0, color: "#94a3b8" }}>
                Step 4 placeholder component (image ignored).
              </p>
            </div>
          );
        }
        """;
        return ValueTask.FromResult(tsx);
    }
}