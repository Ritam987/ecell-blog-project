// This file defines the Express Router for handling chatbot requests.
// It is written in TypeScript/ESM syntax for proper integration.

import express, { Request, Response, Router } from 'express';
import fetch from 'node-fetch'; // NOTE: Requires 'npm install node-fetch'

const router: Router = express.Router();

// --- Configuration (Read from environment variables) ---
// IMPORTANT: These must be set securely on your hosting platform (Render).
const OPENROUTER_API_KEY: string | undefined = process.env.OPENROUTER_API_KEY; 
const APP_REFERER: string = process.env.APP_URL || 'https://ecell-blog-project.onrender.com'; 
const APP_TITLE: string = "E-Cell Blog Assistant";
const MODEL_NAME: string = "openai/gpt-oss-20b:free"; 
const OPENROUTER_ENDPOINT: string = "https://openrouter.ai/api/v1/chat/completions";
// --- End Configuration ---


router.post('/', async (req: Request, res: Response) => {
    // We expect the frontend to send the user's message in the 'message' field.
    const userMessage: string = req.body.message; 

    // 1. Validation and Key Check
    if (!OPENROUTER_API_KEY) {
        return res.status(503).json({ 
            error: "Service Unavailable: API key is not configured.",
            details: "Set OPENROUTER_API_KEY environment variable on the server."
        });
    }

    if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ error: "Invalid or missing 'message' content in request body." });
    }

    // 2. Prepare the payload for OpenRouter
    const apiPayload = {
        "model": MODEL_NAME, 
        "messages": [
            { "role": "system", "content": "You are a helpful assistant for a blogging website. Answer user queries concisely." },
            { "role": "user", "content": userMessage }
        ],
        "max_tokens": 500,
        "temperature": 0.7
    };

    try {
        // 3. Make the secure request to OpenRouter
        const response = await fetch(OPENROUTER_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": APP_REFERER,
                "X-Title": APP_TITLE
            },
            body: JSON.stringify(apiPayload)
        });

        const data: any = await response.json(); // Use 'any' as external API structure is complex

        if (response.ok && data.choices && data.choices.length > 0) {
            const reply: string = data.choices[0].message.content;
            // 4. Send the successful reply back to the frontend using the 'reply' key
            return res.json({ reply });
        } 
        
        // Handle OpenRouter API errors
        console.error("OpenRouter API Error:", JSON.stringify(data));
        return res.status(response.status || 500).json({ 
            error: `AI Service Error: ${data.error?.message || 'Unexpected API response structure'}` 
        });

    } catch (error: any) {
        // Handle network/internal errors
        console.error("Chatbot Proxy Network/Internal Error:", error.message);
        return res.status(500).json({ 
            error: `Network Error: Could not connect to the AI service.`, 
            details: error.message
        });
    }
});

// Export the router using ES Module syntax
export default router;
