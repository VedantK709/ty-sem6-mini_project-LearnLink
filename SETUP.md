# LearnLink Setup & Architecture Guide

This document outlines the environment configuration required to run LearnLink locally and provides a high-level overview of the project's architecture and file structure.

---

## Part 1: Environment Variable Configuration

To run LearnLink, you must configure authentication, a PostgreSQL database, and the Google Gemini API. Create a `.env.local` file in the root directory and populate it with the following variables.

### Authentication Core

These variables handle the security and routing of user sessions.

- **`BETTER_AUTH_SECRET`**: A cryptographic key for signing sessions.
  - _Generation:_ Run `openssl rand -base64 32` in your terminal and paste the output.
- **`BETTER_AUTH_URL`**: The base URL of the authentication server. Set to `http://localhost:3000`.
- **`NEXT_PUBLIC_APP_URL`**: The base URL of the application. Set to `http://localhost:3000`.

### Google OAuth Providers

These credentials allow users to authenticate via their Google accounts.

- **`GOOGLE_CLIENT_ID`** & **`GOOGLE_CLIENT_SECRET`**:
  - _Generation:_ 1. Navigate to the Google Cloud Console. 2. Create a new project, then go to **APIs & Services > Credentials**. 3. Select **Create Credentials > OAuth client ID** (Application type: Web application). 4. Add `http://localhost:3000/api/auth/callback/google` to the **Authorized redirect URIs**. 5. Save and copy the generated ID and Secret.

### Database Configuration

This connection string links the application to your PostgreSQL instance for storing user data.

- **`DATABASE_URL`**:
  - _Generation:_
    1. Create a PostgreSQL 17 project in your provider (e.g., Neon.tech).
    2. Copy the pooled connection string.
    3. _Requirement:_ Execute the Better Auth SQL schema in your database to create the `user`, `session`, and `account` tables before launching the app.

### AI Engine

This key authorizes requests to the Gemini model for course recommendations.

- **`GOOGLE_GENERATIVE_AI_API_KEY`**:
  - _Generation:_ Log into Google AI Studio, click **Create API Key**, and copy the resulting string.

---

## Part 2: System Architecture & Data Flow

For developers new to the codebase, LearnLink follows a standard Next.js full-stack architecture. Below is a breakdown of the core files and how data moves through the application.

### 1. Data Context & Prompting

- **`public/all_courses.csv`**: The static database of available technical courses (metadata includes provider, duration, rating, and URL).
- **`lib/systemPrompt.ts`**: This utility reads the CSV file and dynamically injects its contents into a strict set of system instructions. It bounds the LLM to only recommend real courses from your dataset and enforces Markdown formatting.

### 2. Authentication Flow

- **`lib/auth.ts` & `lib/auth-client.ts`**: Initializes the Better Auth client and connects it to the PostgreSQL database and Google OAuth provider.
- **`app/api/auth/[...all]/route.ts`**: The backend API catch-all route that handles the OAuth redirects, token generation, and database writes when a user logs in or out.

### 3. Frontend (User Interface)

- **`app/page.tsx`**: The application entry point. It checks the user's session state via server-side rendering. Unauthenticated users see a login prompt; authenticated users are served the chat interface.
- **`components/Navbar.tsx`**: The top navigation component that manages the login/logout UI state.
- **`components/LearnLinkChat.tsx`**: The primary client component. It handles the local state of the conversation, sends user prompts to the backend, and processes the incoming streaming response. It also parses the LLM's Markdown output and dynamically fetches favicons for external links.

### 4. Backend (AI Processing)

- **`app/api/chat/route.ts`**: The core API route for the chatbot. When a user submits a message:
  1. It receives the conversation history.
  2. It fetches the system instructions and CSV data from `lib/systemPrompt.ts`.
  3. It sends the payload to the `gemini-2.5-flash` model.
  4. It establishes a `ReadableStream` to return the AI's generated response back to the client chunk-by-chunk, enabling real-time text rendering.
