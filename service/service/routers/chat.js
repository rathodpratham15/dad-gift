// service/service/routers/chat.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    try {
        // Send request to Ollama's local server
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "llama2",
            prompt: message,
            stream: false, // so we get the full reply at once
        });

        const reply = response.data.response || "No reply from model.";
        res.json({ reply });
    } catch (error) {
        console.error("Ollama error:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong with the chatbot." });
    }
});

export default router;


// // For chatgpt
// import express from "express";
// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();

// router.post("/", async (req, res) => {
//     const { message } = req.body;

//     if (!message) return res.status(400).json({ error: "Message is required." });

//     try {
//         const response = await axios.post(
//             "https://api.openai.com/v1/chat/completions",
//             {
//                 model: "gpt-3.5-turbo",
//                 messages: [
//                     {
//                         role: "system",
//                         content: "You are a helpful assistant for a real estate website.",
//                     },
//                     { role: "user", content: message },
//                 ],
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         const reply = response.data.choices[0]?.message?.content || "No reply from AI.";
//         return res.json({ reply });
//     } catch (error) {
//         console.error("OpenAI error:", error.response?.data || error.message);
//         return res.status(500).json({ error: "Something went wrong with the chatbot." });
//     }
// });

// export default router;
