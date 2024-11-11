import avatar from "./Bonick.webp";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";

const BASE_URL =
  "https://vyb2fmcencvxy7saag4ejdedje0yojbh.lambda-url.eu-central-1.on.aws";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle initial form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/start`, {
        name,
        email,
      });
      setThreadId(response.data.thread_id);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Function to handle sending user message
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    // Add user message to the message list
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/chat`, {
        thread_id: threadId,
        message: { text: input },
      });

      // Add AI message to the message list
      setMessages([
        ...newMessages,
        { sender: "bot", text: response.data.response.content },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press for sending message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    if (messages.length === 0) return;
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  return (
    <div>
      {threadId === null ? (
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto mt-4">
          <div className="bg-indigo-500 text-white p-6 rounded-t-lg">
            <img
              src={avatar}
              alt="avatar"
              className="w-40 h-40 mx-auto rounded-full border-4 border-white shadow-sm mb-6"
            />
            <h1 className="text-xl font-bold mb-4 text-center">
              Hi! I'm Bonick. I'm here to answer your questions about technical
              issues. Please enter your name and email to start the chat.
            </h1>
          </div>
          <div className="p-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <button
                type="submit"
                className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600"
              >
                Start
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col bg-white rounded-lg shadow-lg w-full max-w-md h-[600px] mx-auto mt-4">
          <header className="bg-indigo-500 text-white py-4 px-6 rounded-t-lg shadow-md">
            <h1 className="text-lg font-bold">Bonick</h1>
          </header>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 pb-1 my-2 rounded-lg max-w-xs shadow-md ${
                  msg.sender === "user"
                    ? "bg-indigo-500 text-white ml-auto"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <Markdown>{msg.text}</Markdown>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 my-2 max-w-xs bg-gray-200 p-2 rounded-lg">
                <div className="loader"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-gray-100 flex">
            <textarea
              rows="1"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border rounded-lg p-2 mr-2 resize-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
