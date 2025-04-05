/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import axios from "axios";
import "../styles/ChatBot.css";

const API = import.meta.env.VITE_API_URL;

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "bot", text: "Hi! 👋 How can I help you today?" },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { from: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        try {
            const res = await axios.post(`${API}/api/chat`, { message: input });
            const reply = res.data?.reply || "Sorry, I didn't understand that.";
            setMessages((prev) => [...prev, { from: "bot", text: reply }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { from: "bot", text: "⚠️ Sorry, something went wrong." },
            ]);
        }
    };

    return (
        <div>
            {/* Floating Toggle Button */}
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                💬
            </button>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.from}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chatbot-input">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Ask me anything..."
                        />
                        <button onClick={sendMessage}>➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
