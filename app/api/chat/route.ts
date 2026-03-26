import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "@/lib/systemPrompt";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY as string,
);

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 1. Fetch the prompt text (must await since it's now a network request)
  const systemInstructionText = await getSystemPrompt();

  // 2. Load the model and pass the resolved string
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemInstructionText,
  });

  const formattedHistory = messages.slice(0, -1).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const latestMessage = messages[messages.length - 1].content;

  try {
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessageStream(latestMessage);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response("Error generating response", { status: 500 });
  }
}
