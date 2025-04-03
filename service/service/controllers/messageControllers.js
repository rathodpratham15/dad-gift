import Message from "../models/Message.js";

// Get all messages
export async function getAllMessages(req, res) {
    try {
        const messages = await Message.find(); // Use Message.find() directly
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Create a new message
export async function createMessage(req, res) {
    try {
        const { name, email, message } = req.body;

        const newMessage = new Message({
            name,
            email,
            message,
        });

        await newMessage.save();

        res.status(201).json({ message: "Message created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export default { getAllMessages, createMessage };

