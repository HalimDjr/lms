// frontend/src/components/common/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useSelector } from "react-redux";
import { getChatbotResponse } from "../../services/operations/chatbotAPI"; // Import du service API

const ChatBot = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Get response from backend API
      const botResponseText = await getChatbotResponse(userMessage.text);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: botResponseText,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error in chatbot response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Désolé, je rencontre des difficultés à répondre. Veuillez réessayer plus tard.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot button */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg ${
          darkMode
            ? "bg-yellow-50 text-richblack-900"
            : "bg-[#0a2f59] text-white"
        } hover:scale-110 transition-all duration-300`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </motion.button>

      {/* Chatbot window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-xl overflow-hidden shadow-2xl ${
              darkMode
                ? "bg-richblack-800 border border-richblack-700"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 ${
                darkMode
                  ? "bg-gradient-to-r from-blue-900 to-indigo-900"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              } text-white flex justify-between items-center`}
            >
              <div className="flex items-center gap-2">
                <FaRobot size={20} />
                <h3 className="font-semibold">Assistant EPBLearning</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Messages container */}
            <div
              className={`h-80 overflow-y-auto p-4 ${
                darkMode ? "text-richblack-100" : "text-gray-800"
              }`}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? darkMode
                          ? "bg-blue-700 text-white"
                          : "bg-[#0a2f59] text-white"
                        : darkMode
                        ? "bg-richblack-700 text-richblack-100"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-blue-100"
                          : darkMode
                          ? "text-richblack-400"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      darkMode
                        ? "bg-richblack-700 text-richblack-100"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        .
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      >
                        .
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              className={`p-3 border-t ${
                darkMode ? "border-richblack-700" : "border-gray-200"
              } flex items-center gap-2`}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez votre message..."
                className={`flex-grow p-2 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-white border-richblack-600"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                } border focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ""}
                className={`p-2 rounded-lg ${
                  inputMessage.trim() === ""
                    ? darkMode
                      ? "bg-richblack-700 text-richblack-400"
                      : "bg-gray-200 text-gray-400"
                    : darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                    : "bg-[#0a2f59] text-white hover:bg-blue-700"
                } transition-colors`}
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
