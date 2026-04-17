import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.NVIDIA_API_KEY) {
      return res.status(500).json({ error: "API key is missing on the server" });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from LLM API" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: "Internal server error connecting to AI plugin." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend securely running on port ${PORT}`);
});
