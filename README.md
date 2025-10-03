# AI UI Builder (Image ➜ React Component)

An AI-powered tool that converts UI screenshots and wireframes into production-ready React (TypeScript) components using OpenAI's Vision API.

## ✨ Features

- **🖼️ Image to Code**: Upload UI screenshots or wireframes and generate React TSX components automatically
- **🤖 AI Code Refinement**: Improve generated code with AI-powered fixes, formatting, and comprehensive comments
- **✏️ Live Code Editor**: Edit generated code directly in Monaco Editor with TypeScript syntax highlighting
- **📋 Copy & Download**: Easy export of generated components to clipboard or as `.tsx` files
- **🌓 Dark Theme UI**: Modern, minimal dark-themed interface
- **🔒 Secure**: Environment-based configuration keeps sensitive data out of version control

## 🏗️ Architecture

This is a monorepo containing:

- **`/app`** — React + TypeScript (Vite) frontend with Monaco Editor
- **`/server`** — ASP.NET Core + MCP server backend with OpenAI integration
- **`/docs`** — Design notes, prompts, and example images (git-ignored)

### Technology Stack

**Frontend:**

- React 18 + TypeScript
- Vite (build tool)
- Monaco Editor (code editing)
- CSS Variables (theming)

**Backend:**

- ASP.NET Core (.NET 8)
- Model Context Protocol (MCP) Server
- OpenAI API (GPT-4o-mini with Vision)

## 📋 Requirements

Before you begin, ensure you have the following installed:

- **Node.js** LTS (v20 or v22) with npm
- **.NET 8 SDK** (LTS)
- **Git**
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ImageToReactComponentConverter
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server/ImageToReact.McpServer

# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key, server port, and frontend URL
# See .env.example for required variables

# Restore dependencies and run
dotnet restore
dotnet run
```

The backend server will start on the port specified in your `.env` file.

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to app directory
cd app

# Copy environment template
cp .env.example .env

# Edit .env and configure API URL to match your backend server
# See .env.example for required variables

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on Vite's default port.

### 4. Start Using the App

1. Open your browser to the URL shown by Vite (check terminal output)
2. Click **"Choose Image…"** to select a UI screenshot or wireframe
3. Click **"Generate from Image"** to convert it to React TSX code
4. Optionally click **"AI Refine Code"** to improve the generated code
5. Edit the code directly in the Monaco editor
6. Use **"Copy to Clipboard"** or **"Download .tsx"** to export

## 🔧 Configuration

### Environment Variables

#### Backend (`server/ImageToReact.McpServer/.env`)

```env
# Required: Your OpenAI API key
OPENAI_API_KEY=your-openai-api-key-here

# Required: Server port
SERVER_PORT=your-preferred-port

# Required: Frontend URL for CORS
FRONTEND_URL=your-frontend-url
```

#### Frontend (`app/.env`)

```env
# Required: API URL for the MCP server (must match backend SERVER_PORT)
VITE_API_URL=your-backend-url
```

### Important Security Notes

- **Never commit `.env` files** to version control (already in `.gitignore`)
- Keep your OpenAI API key confidential
- Use `.env.example` files as templates for team members

## 📁 Project Structure

```
ImageToReactComponentConverter/
├── app/                          # Frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── CodePane.tsx      # Monaco code editor wrapper
│   │   │   └── UploadImage.tsx   # Image file upload component
│   │   ├── App.tsx               # Main application component
│   │   ├── main.tsx              # Application entry point
│   │   └── index.css             # Global styles
│   ├── .env                      # Environment config (git-ignored)
│   ├── .env.example              # Environment template
│   ├── package.json              # Dependencies and scripts
│   └── vite.config.ts            # Vite configuration
│
├── server/                       # Backend application
│   └── ImageToReact.McpServer/
│       ├── Program.cs            # Main server + API endpoints
│       ├── .env                  # Environment config (git-ignored)
│       ├── .env.example          # Environment template
│       └── *.csproj              # .NET project file
│
├── docs/                         # Documentation (git-ignored)
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🎯 How It Works

### Image to Component Generation

1. User uploads a UI screenshot/wireframe
2. Frontend converts image to base64 and sends to backend
3. Backend calls OpenAI Vision API (GPT-4o-mini) with specialized prompt
4. AI analyzes the image and generates semantic React TSX code
5. Generated code is displayed in Monaco Editor for editing

### AI Code Refinement

1. User clicks "AI Refine Code" button
2. Current code is sent to backend `/api/refine-code` endpoint
3. Backend uses OpenAI to:
   - Fix syntax errors and type issues
   - Format code with consistent style
   - Add comprehensive JSDoc comments
   - Improve naming and structure
4. Refined code replaces the original in the editor

## 🛠️ Development

### Available Scripts

**Frontend (`/app`):**

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend (`/server/ImageToReact.McpServer`):**

```bash
dotnet run           # Start server
dotnet build         # Build project
dotnet clean         # Clean build artifacts
```

### Git Workflow

- Main development branch: `main`
- Feature branches: `feat/feature-name`
- Create PRs for code review before merging to `main`

## 🐛 Troubleshooting

### "Failed to fetch" Error

- Ensure backend server is running
- Check that `VITE_API_URL` in frontend `.env` matches your backend server URL (including port)
- Verify `FRONTEND_URL` in backend `.env` matches your frontend dev server URL
- Ensure both `.env` files are properly configured with matching URLs

### Backend Won't Start

- Verify `.NET 8 SDK` is installed: `dotnet --version`
- Check that `OPENAI_API_KEY` is set in `server/ImageToReact.McpServer/.env`
- Review console output for specific error messages

### Frontend Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Verify Node.js version: `node --version` (should be v20 or v22)
- Check that `.env` file exists with valid `VITE_API_URL`

## 📝 API Endpoints

### `POST /api/image-to-react`

Converts an image to React TSX code.

**Request:**

```json
{
  "imageBase64": "data:image/png;base64,...",
  "hints": "produce a clean, semantic layout"
}
```

**Response:**

```json
{
  "tsx": "import React from 'react';\n\nexport default function..."
}
```

### `POST /api/refine-code`

Refines existing TSX code with AI improvements.

**Request:**

```json
{
  "code": "export default function Component() { ... }"
}
```

**Response:**

```json
{
  "refinedCode": "/**\n * Component description...\n */\nexport default..."
}
```

## 📄 License

This project is provided as-is for educational and development purposes.

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini Vision API
- Monaco Editor team
- ASP.NET Core and React communities

---

**Happy Building! 🚀**
