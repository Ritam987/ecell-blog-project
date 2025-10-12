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
        // Log this error as it prevents functionality
        console.error("Chatbot Error: OPENROUTER_API_KEY is not set.");
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
                "HTTP-Referer": APP_REFERER, // Required for OpenRouter
                "X-Title": APP_TITLE // Required for OpenRouter
            },
            body: JSON.stringify(apiPayload)
        });

        // Safely read response as text first to catch upstream non-JSON errors
        const responseText = await response.text();
        let data: any;

        try {
            data = JSON.parse(responseText);
        } catch (e) {
            // If response is not valid JSON, it's an unexpected upstream error
            console.error(`OpenRouter upstream non-JSON response (Status: ${response.status}):`, responseText.substring(0, 200));
            return res.status(502).json({
                error: "Bad Gateway: Upstream AI service returned an unparseable response.",
                details: `Status ${response.status}. Response start: ${responseText.substring(0, 50)}...`
            });
        }
        
        // 4. Check for success (HTTP 200-299) AND expected content structure
        if (response.ok && data.choices && data.choices.length > 0) {
            const reply: string = data.choices[0].message.content;
            // Send the successful reply back to the frontend
            return res.json({ reply });
        }
        
        // 5. Explicitly handle success status (200) but missing content
        if (response.status >= 200 && response.status < 300) {
            console.warn("OpenRouter API Warning: Successful status but missing choices/content.", JSON.stringify(data));
            // Return an internal server error (500) to the client
            return res.status(500).json({ 
                error: "Internal Error: AI service failed to generate a reply despite successful connection.",
                details: data.error?.message || 'Received 200 OK from AI service but no response content was found.'
            });
        }
        
        // 6. Handle known OpenRouter API errors (non-2xx status)
        console.error("OpenRouter API Error (Non-2xx Status):", response.status, JSON.stringify(data));
        return res.status(response.status || 500).json({ 
            error: `AI Service Error (${response.status}): ${data.error?.message || 'Unexpected API response structure'}` 
        });

    } catch (error: any) {
        // Handle network/internal errors (e.g., DNS, connection refused)
        console.error("Chatbot Proxy Network/Internal Error:", error.message);
        return res.status(500).json({ 
            error: `Network Error: Could not connect to the AI service endpoint.`, 
            details: error.message
        });
    }
});

// Export the router using ES Module syntax
export default router;
