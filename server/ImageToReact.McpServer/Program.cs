using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env (server-side only)
DotNetEnv.Env.Load(); // looks for .env in current working dir
var openAiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
if (string.IsNullOrWhiteSpace(openAiApiKey))
{
    throw new InvalidOperationException("OPENAI_API_KEY is not set. Create server/.env and add OPENAI_API_KEY=...");
}

// Read server port from .env or default to 5287
var serverPort = Environment.GetEnvironmentVariable("SERVER_PORT") ?? "5287";
builder.WebHost.UseUrls($"http://localhost:{serverPort}");

// Console logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Register MCP server and auto-discover tool methods in this assembly
builder.Services
    .AddMcpServer()
    .WithToolsFromAssembly(); // finds [McpServerToolType] types with [McpServerTool] methods

// Allow calls from your Vite dev server
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Basic HttpClient for OpenAI calls
builder.Services.AddHttpClient("openai", client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/v1/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", openAiApiKey);
});

var app = builder.Build();
app.UseCors();

app.MapGet("/", () => "ImageToReact MCP server is running");

// NOTE: Depending on the MCP C# SDK preview version you installed,
// there may be helpers to map HTTP/SSE MCP endpoints (e.g., MapMcpHttp/MapMcpSse).
// Use them if present in your package version. The REST façade below is
// just for convenience testing from the browser.

// ---- Convenience REST façade for quick fetch() from React ----
// This calls the same logic as our MCP tool method.
app.MapPost("/api/image-to-react", async (ImageToReactTool.Input input, IHttpClientFactory httpFactory) =>
{
    var tsx = await ImageToReactTool.ImageToReact(input, httpFactory);
    return Results.Json(new { tsx });
});

app.MapPost("/api/refine-code", async (RefineCodeTool.Input input, IHttpClientFactory httpFactory) =>
{
    var refinedCode = await RefineCodeTool.RefineCode(input, httpFactory);
    return Results.Json(new { refinedCode });
});

app.Run();


// ================== MCP TOOL TYPE ==================
[McpServerToolType]
public static class ImageToReactTool
{
    // Input the browser sends us (image as base64 data URL or raw base64 string)
    public class Input
    {
        public required string ImageBase64 { get; set; }
        public string? Hints { get; set; } // optional UI hints you may pass from the UI
    }

    /// <summary>
    /// Calls OpenAI (vision) with the provided image and returns a single, self-contained
    /// React TSX component as a string. We use Chat Completions with a vision-capable model.
    /// </summary>
    [McpServerTool, Description("Convert a UI image to a React TSX component.")]
    public static async ValueTask<string> ImageToReact(Input input, IHttpClientFactory httpFactory)
    {
        // 1) Normalize the incoming image: ensure we have a data URL
        // If user passed raw base64 like "AAAA...", build a data URL.
        var dataUrl = input.ImageBase64.Trim();
        if (!dataUrl.StartsWith("data:image"))
        {
            // assume PNG if not specified; adjust if you detect JPEG, etc.
            dataUrl = $"data:image/png;base64,{dataUrl}";
        }

        // 2) Build a very explicit system/user prompt so the model returns clean TSX.
        var systemPrompt =
@"You are an expert React + TypeScript UI generator.
Given a UI screenshot or sketch, output a single, self-contained React component in TSX.
Follow these rules STRICTLY:
- Use a default export function component.
- No external network calls, no external libraries (React only).
- Inline styles or basic classNames only (no CSS frameworks).
- Use straightforward semantic HTML structure based on the image.
- Add brief JSDoc at the top documenting the component and its props (if any).
- Return ONLY a Markdown fenced code block with language 'tsx' (no extra commentary).";

        var userPrompt = $@"Generate a React TSX component that best matches the UI in the provided image.
{(string.IsNullOrWhiteSpace(input.Hints) ? "" : $"Extra hints: {input.Hints}")}";

        // 3) Call OpenAI Chat Completions with a vision-capable model (e.g., gpt-4o-mini).
        var http = httpFactory.CreateClient("openai");

        var payload = new
        {
            model = "gpt-4o-mini",
            messages = new object[]
            {
                new {
                    role = "system",
                    content = new object[] {
                        new { type = "text", text = systemPrompt }
                    }
                },
                new {
                    role = "user",
                    content = new object[] {
                        new { type = "text", text = userPrompt },
                        new { type = "image_url", image_url = new { url = dataUrl } }
                    }
                }
            },
            temperature = 0.2,
            // keep responses compact; we only need a single component
            max_tokens = 1200
        };

        var json = JsonSerializer.Serialize(payload);
        using var req = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        using var res = await http.SendAsync(req);
        var body = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
        {
            // Return a friendly TSX error component so the UI can still render something.
            var errorMsg = $"OpenAI API error {(int)res.StatusCode}: {body}";
            return WrapAsErrorComponent(errorMsg);
        }

        // 4) Parse the result and extract the code block (```tsx ... ```).
        using var doc = JsonDocument.Parse(body);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(content))
            return WrapAsErrorComponent("Empty response from model.");

        // Extract ```tsx ... ``` fenced block if present
        var match = Regex.Match(content, "```tsx\\s*([\\s\\S]*?)```", RegexOptions.Multiline);
        var tsx = match.Success ? match.Groups[1].Value.Trim() : content.Trim();

        // Basic safety: ensure it exports a default component; if not, wrap it.
        if (!tsx.Contains("export default"))
        {
            tsx = "export default function GeneratedComponent(){ return (<div>Component missing. Model output:</div>); }\n\n" + tsx;
        }

        return tsx;
    }

    private static string WrapAsErrorComponent(string msg) =>
$@"import React from ""react"";
export default function GeneratedError() {{
  return (
    <div style={{padding:16, border:'1px solid #7f1d1d', background:'#431515', color:'#fecaca', borderRadius:12}}>
      <h3 style={{margin:'0 0 8px'}}>Generation Error</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{EscapeForJsx(msg)}</pre>
    </div>
  );
}}
";

    // Minimal escape for JSX <pre>
    private static string EscapeForJsx(string s) =>
        s.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
}

// ================== REFINE CODE TOOL ==================
[McpServerToolType]
public static class RefineCodeTool
{
    public class Input
    {
        public required string Code { get; set; }
    }

    /// <summary>
    /// Takes existing TSX code and refines it by:
    /// - Fixing any syntax errors or issues
    /// - Properly formatting the code
    /// - Adding comprehensive JSDoc comments
    /// - Improving code structure and readability
    /// </summary>
    [McpServerTool, Description("Refine and improve existing React TSX code with fixes, formatting, and comments.")]
    public static async ValueTask<string> RefineCode(Input input, IHttpClientFactory httpFactory)
    {
        var systemPrompt =
@"You are an expert React + TypeScript code refactoring assistant.
Given existing TSX code, you must:
1. Fix any syntax errors, bugs, or type issues
2. Format the code properly with consistent indentation and spacing
3. Add comprehensive JSDoc comments explaining the component, props, and complex logic
4. Improve code structure, naming, and readability
5. Ensure the code follows React and TypeScript best practices

IMPORTANT RULES:
- Preserve the original functionality - do not change what the component does
- Return ONLY a Markdown fenced code block with language 'tsx' (no extra commentary)
- The code should be production-ready and well-documented";

        var userPrompt = $@"Please refine, fix, format, and add proper comments to this React TSX code:

{input.Code}";

        var http = httpFactory.CreateClient("openai");

        var payload = new
        {
            model = "gpt-4o-mini",
            messages = new object[]
            {
                new {
                    role = "system",
                    content = systemPrompt
                },
                new {
                    role = "user",
                    content = userPrompt
                }
            },
            temperature = 0.3,
            max_tokens = 2000
        };

        var json = JsonSerializer.Serialize(payload);
        using var req = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        using var res = await http.SendAsync(req);
        var body = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
        {
            var errorMsg = $"OpenAI API error {(int)res.StatusCode}: {body}";
            return $"// Error refining code: {errorMsg}\n\n{input.Code}";
        }

        using var doc = JsonDocument.Parse(body);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(content))
            return input.Code;

        // Extract ```tsx ... ``` fenced block if present
        var match = Regex.Match(content, "```tsx\\s*([\\s\\S]*?)```", RegexOptions.Multiline);
        var refinedTsx = match.Success ? match.Groups[1].Value.Trim() : content.Trim();

        return refinedTsx;
    }
}