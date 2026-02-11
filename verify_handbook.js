const fetch = require('node-fetch');

const API_KEY = "sk_test_123456789";
const BASE_URL = "http://localhost:3000"; // Assume server is running locally

async function testVoiceDetection() {
    console.log("\n--- Testing Voice Detection ---");
    const payload = {
        language: "Tamil",
        audioFormat: "mp3",
        audioBase64: "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAA..."
    };

    const res = await fetch(`${BASE_URL}/api/voice-detection`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.status === "success" && data.classification) {
        console.log("✅ Voice Detection Test Passed");
    } else {
        console.log("❌ Voice Detection Test Failed");
    }
}

async function testHoneypot() {
    console.log("\n--- Testing Honeypot ---");
    const payload = {
        sessionId: "test-session-123",
        message: {
            sender: "scammer",
            text: "Your bank account will be blocked today. Verify immediately.",
            timestamp: Date.now()
        },
        conversationHistory: [],
        metadata: {
            channel: "SMS",
            language: "English",
            locale: "IN"
        }
    };

    const res = await fetch(`${BASE_URL}/api/honeypot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.status === "success" && data.reply) {
        console.log("✅ Honeypot Test Passed");
    } else {
        console.log("❌ Honeypot Test Failed");
    }
}

async function runTests() {
    try {
        await testVoiceDetection();
        await testHoneypot();
    } catch (err) {
        console.error("Test error:", err.message);
        console.log("Make sure to run 'npm start' before running tests.");
    }
}

runTests();
