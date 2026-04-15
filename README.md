# LearnLink: Tech Course Recommendation Chatbot

LearnLink is an intelligent, LLM-powered chatbot designed to help students and professionals find the best technical courses across platforms like Coursera, Udemy, GeeksforGeeks, and PWSkills[cite: 2, 49].

By processing natural language queries, LearnLink filters through a curated dataset of courses to provide personalized recommendations aligned with your career goals and skill level[cite: 11, 12, 53].

## 🚀 Features

- **AI-Powered Recommendations:** Utilizes Google's Gemini 2.5 Flash model to provide conversational, context-aware course suggestions[cite: 10].
- **Rich Text UI:** Renders Markdown beautifully, complete with dynamic favicons for external course links.
- **Secure Authentication:** Seamless Google OAuth login powered by Better Auth.
- **Modern Stack:** Built on the Next.js App Router with Tailwind CSS for a responsive, fast user experience.
- **Curated Dataset:** Recommends courses based on an internal CSV database of highly-rated technical courses[cite: 10, 50].

## 🛠️ Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have Node.js (v20 or higher) installed on your machine.

### 1. Clone the Repository

```bash
git clone https://github.com/VedantK709/LearnLink.git
cd LearnLink
```

### 2. Install Dependencies

Install all the required packages (Next.js, Better Auth, Gemini SDK, React Markdown, etc.):

```bash
npm install

```

### 3. Environment Variables

_Note: For convenience in this specific setup, the `.env.local` file containing the database connection strings, Better Auth secrets, and Gemini API keys is already included in the repository. No manual environment configuration is required!_

### 4. Run the Development Server

Start the Next.js server:

```bash
npm run dev

```

### 5. Open the App

Open your browser and navigate to [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).
Click **Sign in with Google** to authenticate, and start chatting with LearnLink!

## 📚 Tech Stack

- **Frontend/Backend:** Next.js (React)
- **Authentication:** Better Auth & Google Cloud OAuth
- **Database:** Neon (Serverless PostgreSQL)
- **AI Engine:** Google Generative AI (Gemini 2.5 Flash)
- **Styling:** Tailwind CSS & Lucide React Icons
