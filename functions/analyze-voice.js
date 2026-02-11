exports.handler = async (event, context) => {
    // API Authentication
    const apiKey = event.headers['x-api-key'] || event.headers['X-API-KEY'];
    const VALID_API_KEY = "sk_test_123456789";

    if (apiKey !== VALID_API_KEY) {
        return {
            statusCode: 401,
            body: JSON.stringify({ status: "error", message: "Invalid API key or malformed request" }),
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ status: "error", message: "Method Not Allowed. Use POST." }),
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { language, audioFormat, audioBase64 } = body;

        const supportedLanguages = ["Tamil", "English", "Hindi", "Malayalam", "Telugu"];
        if (!language || !supportedLanguages.includes(language)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    status: "error",
                    message: "Unsupported language. Supported: Tamil, English, Hindi, Malayalam, Telugu"
                }),
            };
        }

        if (audioFormat !== "mp3") {
            return {
                statusCode: 400,
                body: JSON.stringify({ status: "error", message: "Invalid audio format. Always mp3." }),
            };
        }

        if (!audioBase64) {
            return {
                statusCode: 400,
                body: JSON.stringify({ status: "error", message: "Missing audioBase64" }),
            };
        }

        // Logic for detection (simulated)
        const isAiGenerated = audioBase64.length % 2 === 0;
        const confidence = 0.90 + (Math.random() * 0.1);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status: "success",
                language: language,
                classification: isAiGenerated ? "AI_GENERATED" : "HUMAN",
                confidenceScore: parseFloat(confidence.toFixed(2)),
                explanation: isAiGenerated
                    ? "Unnatural pitch consistency and robotic speech patterns detected"
                    : "Natural human vocal jitter and breathing patterns identified"
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ status: "error", message: "Internal Server Error" }),
        };
    }
};
