/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import axios from "axios";
import "../styles/ChatBot.css"; // We'll create this file for styles

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "bot", text: "Hi! 👋 How can I help you today?" },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { from: "user", text: input };
        setMessages([...messages, userMsg]);
        setInput("");

        try {
            const res = await axios.post("http://localhost:3002/api/chat", { message: input });
            setMessages((msgs) => [...msgs, { from: "bot", text: res.data.reply }]);
        } catch (err) {
            setMessages((msgs) => [...msgs, { from: "bot", text: "Sorry, something went wrong." }]);
        }
    };

    return (
        <div>
            {/* Floating Icon */}
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                💬
            </button>

            {/* Chat Window */}
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
