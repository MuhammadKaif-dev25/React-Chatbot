import { useState, useRef, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [userQuery, setUserQuery] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userQuery.trim() || isLoading) return;

    const currentPrompt = userQuery;
    
    // Clear input field immediately for smooth UX
    setUserQuery("");

    // Add user message to conversation history
    setConversation((prev) => [
      ...prev,
      { role: "user", content: currentPrompt },
    ]);

    setIsLoading(true);

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      const apiRes = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: "You are Kaif, a Software Engineer. Only answer software development and tech questions. Politely decline any non-technical topics.",
                },
                {
                  text: currentPrompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "x-goog-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const data = apiRes.data;
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response generated.";

      // Add AI response to conversation history
      setConversation((prev) => [
        ...prev,
        { role: "ai", content: reply },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setConversation((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, something went wrong. Please check your API key or network connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 p-4 bg-slate-950/50 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold tracking-wide">AI Assistant</h1>
          </div>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
            Gemini API
          </span>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 space-y-2">
              <svg
                className="w-12 h-12 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-medium">How can I help you today?</p>
              <p className="text-sm">Type a message below to start the conversation.</p>
            </div>
          ) : (
            conversation.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md whitespace-pre-wrap text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-70">
                    {message.role === "user" ? "You" : "AI"}
                  </p>
                  <div>{message.content}</div>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 text-slate-400 text-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Form */}
      <footer className="border-t border-slate-800 bg-slate-950 p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={userQuery}
            disabled={isLoading}
            placeholder={isLoading ? "Thinking..." : "Type your message..."}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !userQuery.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium px-5 py-3 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Send</span>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;