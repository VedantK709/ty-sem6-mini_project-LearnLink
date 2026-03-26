"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BookOpen, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function LearnLinkChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold">LearnLink Assistant</h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium">Welcome to LearnLink!</p>
            <p className="text-sm mt-1">
              Ask me for a tech course recommendation.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isAssistantLoading =
            isLoading &&
            message.role === "assistant" &&
            message.content === "" &&
            isLastMessage;

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              )}

              <div
                className={`px-5 py-4 rounded-2xl max-w-[85%] text-sm md:text-base ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                }`}
              >
                {/* LOADING STATE UI */}
                {isAssistantLoading ? (
                  <div className="flex items-center gap-3 text-slate-500 italic">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Searching dataset...</span>
                  </div>
                ) : message.role === "user" ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => {
                        let domain = "";
                        try {
                          domain = new URL(props.href || "").hostname;
                        } catch (e) {}
                        return (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 underline font-semibold transition-colors mt-1"
                          >
                            {domain && (
                              <img
                                src={`https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`}
                                alt="favicon"
                                className="w-4 h-4 rounded-sm"
                              />
                            )}
                            {props.children}
                          </a>
                        );
                      },
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc pl-5 my-3 space-y-2"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal pl-5 my-3 space-y-2"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="leading-relaxed" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="mb-3 last:mb-0 leading-relaxed"
                          {...props}
                        />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className="font-bold text-slate-900"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}

                {/* Blinking cursor during active streaming */}
                {isLoading &&
                  message.role === "assistant" &&
                  message.content !== "" &&
                  isLastMessage && (
                    <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse"></span>
                  )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all"
        >
          <input
            className="flex-1 bg-transparent border-none focus:outline-none py-2 text-slate-700 placeholder-slate-400"
            value={input}
            placeholder="E.g., I want to learn Next.js, what do you recommend?"
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
