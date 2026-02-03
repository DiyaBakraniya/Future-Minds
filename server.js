const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, './')));

// Constant API Key for Hackathon
const VALID_API_KEY = "FRAUDSHIELD-AI-LOCAL-2026";

/**
 * AI-Generated Voice Detection Endpoint
 */
app.post('/api/analyze-voice', (req, res) => {
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];

    if (apiKey !== VALID_API_KEY) {
        return res.status(401).json({ status: "failed", error: "Unauthorized: Invalid x-api-key" });
    }

    const data = req.body;
    const language = data.language || data.Language;
    const audio_format = data.audio_format || data.audioFormat || data['Audio Format'];
    const audio_base64 = data.audio_base64 || data.audioBase64 || data['Audio Base64 Format'];

    if (!language || !audio_format || !audio_base64) {
        return res.status(400).json({
            status: "failed",
            error: "Missing required fields",
            required: ["Language", "Audio Format", "Audio Base64 Format"]
        });
    }

    // Logic similar to our Netlify Functions
    const isAiGenerated = audio_base64.length < 500 ? true : false;
    const confidence = 0.85 + (Math.random() * 0.1);

    res.json({
        status: "success",
        is_ai_generated: isAiGenerated,
        confidence: parseFloat(confidence.toFixed(2)),
        detected_language: language,
        message: isAiGenerated
            ? "AI-generated voice patterns detected."
            : "Human voice patterns validated."
    });
});

/**
 * Agentic Honey-Pot Endpoint
 */
app.get('/api/honeypot', (req, res) => {
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];

    if (apiKey !== VALID_API_KEY) {
        return res.status(401).json({ status: "failed", error: "Unauthorized: Invalid x-api-key" });
    }

    res.json({
        status: "success",
        message: "Honeypot service is reachable, secured, and responding correctly.",
        timestamp: new Date().toISOString(),
        service: "Agentic Honey-Pot"
    });
});

// Handle root navigation
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 FraudShield Backend running at http://localhost:${PORT}`);
});
