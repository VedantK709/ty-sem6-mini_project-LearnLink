import fs from "fs";
import path from "path";

// Cache to avoid re-fetching on every message
let cachedCourses: string | null = null;

export async function getSystemPrompt(): Promise<string> {
  const DATASET_URL = process.env.HUGGING_FACE_DATASET_URL!;

  // 1. Return cached data if available
  if (cachedCourses) {
    return generatePrompt(cachedCourses);
  }

  try {
    console.log("Downloading course dataset from Hugging Face...");
    const response = await fetch(DATASET_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (LearnLink-Bot)" },
    });

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const fullText = await response.text();
    cachedCourses = processCSV(fullText);
    console.log("✅ Dataset loaded from Hugging Face");
  } catch (error) {
    console.warn(
      "⚠️ Hugging Face unavailable, falling back to local CSV:",
      error,
    );

    try {
      // 2. Local Fallback: Read from public/all_courses.csv
      const localPath = path.join(process.cwd(), "public", "all_courses.csv");
      const localContent = fs.readFileSync(localPath, "utf-8");
      cachedCourses = processCSV(localContent);
      console.log("🏠 Successfully loaded local fallback data");
    } catch (localError) {
      console.error("❌ Critical: Could not load any data source.");
      cachedCourses = "No course data available.";
    }
  }

  return generatePrompt(cachedCourses);
}

// Logic to slice the first 150 rows
function processCSV(text: string): string {
  const lines = text.split("\n");
  return lines.slice(0, 150).join("\n");
}

function generatePrompt(data: string): string {
  return `You are LearnLink, an intelligent chatbot designed to recommend technical courses.
Your goal is to help students and professionals navigate platforms like Coursera, Udemy, PWSkills, and GeeksforGeeks.

IMPORTANT DATA SOURCE:
You must use the following internal CSV database of courses to make recommendations:
\`\`\`csv
${data}
\`\`\`

When a user asks for a recommendation:
1. Search through the provided CSV data for the best matches.
2. Suggest 2-3 specific courses based strictly on the provided data.
3. Clearly state the Course Name, Provider, Duration, Rating, and a brief reason.
4. ALWAYS provide the exact URL from the CSV formatted as a Markdown link (e.g., [Course Name](URL)).
5. Format your responses cleanly using Markdown bullet points.
6. Be conversational and encouraging.`;
}
