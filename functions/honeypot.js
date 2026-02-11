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
        const { sessionId, message } = body;

        if (!sessionId || !message || !message.text) {
            return {
                statusCode: 400,
                body: JSON.stringify({ status: "error", message: "Invalid request. Missing sessionId or message.text" }),
            };
        }

        const text = message.text.toLowerCase();
        let reply = "I'm a bit confused, can you explain what I need to do again?";

        if (text.includes("bank") || text.includes("blocked") || text.includes("verify")) {
            reply = "Oh no! Why is my account being suspended? What should I do?";
        } else if (text.includes("upi") || text.includes("payment") || text.includes("id")) {
            reply = "I'm not sure where to find my UPI ID. Can you tell me how to check it?";
        } else if (text.includes("link") || text.includes("click") || text.includes("open")) {
            reply = "The link is not opening on my phone. Is there another way?";
        } else if (text.includes("winner") || text.includes("lottery") || text.includes("prize")) {
            reply = "Wow, really? I won? How do I get the money?";
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status: "success",
                reply: reply
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ status: "error", message: "Internal Server Error" }),
        };
    }
};
