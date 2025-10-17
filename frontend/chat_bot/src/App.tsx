import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Trash2, Send } from "lucide-react";

const API_BASE = "http://localhost:8080"; // Flask backend URL

interface Message {
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { prompt: input });
      const botMessage: Message = {
        role: "bot",
        content: response.data.reply,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: "bot",
        content:
          error.response?.data?.error ||
          "⚠️ Sorry, something went wrong. Try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const clearChat = () => setMessages([]);

  return (
    <div
      className={`flex flex-col h-screen items-center justify-center transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="w-full max-w-2xl flex flex-col h-[90vh] rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h1 className="text-xl font-semibold">Thilan's Chatbot 🤖</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={clearChat}
              className="p-2 rounded-md hover:bg-white/20 transition"
              title="Clear Chat"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md hover:bg-white/20 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-900">
          {messages.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 mt-16">
              <p>Hello! 👋 Ask me anything about code, AI, or the universe 🌌</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[75%] p-3 rounded-2xl shadow-md ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    <span className="block">{msg.content}</span>
                    <span className="absolute bottom-1 right-3 text-[10px] opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl px-4 py-2 animate-pulse">
                Typing<span className="animate-ping">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full outline-none border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
