// AI-Based Fraud Detection Engine
// This module analyzes text messages for fraud patterns using NLP heuristics

class FraudDetectionEngine {
    constructor() {
        // Fraud keywords and patterns
        this.fraudKeywords = {
            urgency: ['urgent', 'immediately', 'now', 'asap', 'hurry', 'quick', 'fast', 'expire', 'limited time'],
            money: ['winner', 'won', 'prize', 'lottery', 'million', 'thousand', 'cash', 'reward', 'claim', 'free money'],
            banking: ['bank account', 'credit card', 'debit card', 'cvv', 'pin', 'otp', 'password', 'verify account', 'suspended', 'blocked'],
            threats: ['suspend', 'block', 'terminate', 'legal action', 'arrest', 'police', 'court', 'fine'],
            requests: ['click here', 'click link', 'download', 'install', 'update', 'verify', 'confirm', 'send money', 'transfer'],
            impersonation: ['bank', 'government', 'tax department', 'irs', 'police', 'courier', 'delivery', 'amazon', 'paypal']
        };

        this.suspiciousPatterns = [
            /\b\d{16}\b/g, // Credit card numbers
            /\b\d{3}-\d{2}-\d{4}\b/g, // SSN patterns
            /http[s]?:\/\/(?!.*(?:google|facebook|amazon|apple|microsoft))[^\s]+/gi, // Suspicious URLs
            /\$\d+[,\d]*(?:\.\d{2})?/g, // Money amounts
            /₹\d+[,\d]*(?:\.\d{2})?/g, // Indian Rupee amounts
        ];
    }

    /**
     * Main analysis function
     * @param {string} message - The message to analyze
     * @returns {Object} Analysis result with risk score, classification, and flags
     */
    analyze(message) {
        if (!message || message.trim().length === 0) {
            return {
                classification: 'safe',
                riskScore: 0,
                flags: [],
                explanation: 'No message provided'
            };
        }

        const normalizedMessage = message.toLowerCase();
        const flags = [];
        let riskScore = 0;

        // Check for fraud keywords
        for (const [category, keywords] of Object.entries(this.fraudKeywords)) {
            const matchedKeywords = keywords.filter(keyword =>
                normalizedMessage.includes(keyword.toLowerCase())
            );

            if (matchedKeywords.length > 0) {
                const categoryRisk = this.getCategoryRisk(category, matchedKeywords.length);
                riskScore += categoryRisk;

                flags.push({
                    category: category,
                    icon: this.getCategoryIcon(category),
                    text: this.getCategoryMessage(category, matchedKeywords),
                    severity: categoryRisk
                });
            }
        }

        // Check for suspicious patterns
        for (const pattern of this.suspiciousPatterns) {
            const matches = message.match(pattern);
            if (matches && matches.length > 0) {
                riskScore += 15;
                flags.push({
                    category: 'pattern',
                    icon: '🔍',
                    text: `Suspicious pattern detected: ${this.getPatternDescription(pattern)}`,
                    severity: 15
                });
            }
        }

        // Check message length and structure
        if (message.length < 20) {
            riskScore += 5;
        }

        // Check for excessive punctuation (!!!, ???)
        const excessivePunctuation = /[!?]{3,}/g;
        if (excessivePunctuation.test(message)) {
            riskScore += 10;
            flags.push({
                category: 'urgency',
                icon: '⚡',
                text: 'Excessive punctuation detected (urgency tactic)',
                severity: 10
            });
        }

        // Check for ALL CAPS (shouting)
        const capsWords = message.match(/\b[A-Z]{4,}\b/g);
        if (capsWords && capsWords.length > 2) {
            riskScore += 10;
            flags.push({
                category: 'urgency',
                icon: '📢',
                text: 'Excessive capitalization detected (pressure tactic)',
                severity: 10
            });
        }

        // Normalize risk score to 0-100
        riskScore = Math.min(100, riskScore);

        // Determine classification
        let classification;
        if (riskScore < 30) {
            classification = 'safe';
        } else if (riskScore < 70) {
            classification = 'suspicious';
        } else {
            classification = 'fraud';
        }

        return {
            classification,
            riskScore,
            flags: flags.sort((a, b) => b.severity - a.severity),
            explanation: this.getExplanation(classification, riskScore)
        };
    }

    /**
     * Get risk score for a category based on matches
     */
    getCategoryRisk(category, matchCount) {
        const baseRisks = {
            urgency: 15,
            money: 25,
            banking: 30,
            threats: 25,
            requests: 20,
            impersonation: 20
        };
        return (baseRisks[category] || 10) * Math.min(matchCount, 3);
    }

    /**
     * Get icon for category
     */
    getCategoryIcon(category) {
        const icons = {
            urgency: '⚡',
            money: '💰',
            banking: '🏦',
            threats: '⚠️',
            requests: '🔗',
            impersonation: '🎭'
        };
        return icons[category] || '🚩';
    }

    /**
     * Get human-readable message for category
     */
    getCategoryMessage(category, keywords) {
        const messages = {
            urgency: `Urgency tactics detected: "${keywords.slice(0, 3).join(', ')}"`,
            money: `Money-related fraud keywords: "${keywords.slice(0, 3).join(', ')}"`,
            banking: `Banking/financial information requested: "${keywords.slice(0, 3).join(', ')}"`,
            threats: `Threatening language detected: "${keywords.slice(0, 3).join(', ')}"`,
            requests: `Suspicious action requests: "${keywords.slice(0, 3).join(', ')}"`,
            impersonation: `Possible impersonation attempt: "${keywords.slice(0, 3).join(', ')}"`,
        };
        return messages[category] || `Suspicious content detected`;
    }

    /**
     * Get description for pattern
     */
    getPatternDescription(pattern) {
        const descriptions = {
            '/\\b\\d{16}\\b/g': 'Credit card number',
            '/\\b\\d{3}-\\d{2}-\\d{4}\\b/g': 'Social security number',
            '/http[s]?:\\/\\/(?!.*(?:google|facebook|amazon|apple|microsoft))[^\\s]+/gi': 'Suspicious URL',
            '/\\$\\d+[,\\d]*(?:\\.\\d{2})?/g': 'Money amount',
            '/₹\\d+[,\\d]*(?:\\.\\d{2})?/g': 'Money amount'
        };
        return descriptions[pattern.toString()] || 'Unknown pattern';
    }

    /**
     * Get explanation for classification
     */
    getExplanation(classification, riskScore) {
        if (classification === 'safe') {
            return 'This message appears to be safe with no significant fraud indicators.';
        } else if (classification === 'suspicious') {
            return 'This message contains some suspicious elements. Exercise caution and verify the sender.';
        } else {
            return 'This message shows strong fraud indicators. Do not respond or share any information.';
        }
    }

    /**
     * Get demo messages for testing
     */
    getDemoMessage(type) {
        const demos = {
            safe: "Hi! Just wanted to let you know I'll be home late today. Don't wait for dinner. See you soon!",
            suspicious: "Your bank account has been temporarily locked due to suspicious activity. Please verify your account details by clicking this link: http://verify-account-now.xyz",
            fraud: "CONGRATULATIONS!!! You have WON $1,000,000 in our lottery! To claim your prize, send $500 processing fee IMMEDIATELY to account 1234567890. URGENT - Offer expires in 24 hours! Click here NOW: http://claim-prize-winner.com"
        };
        return demos[type] || demos.safe;
    }

    /**
     * Get simulation steps for a call
     */
    getCallSimulation(type) {
        const simulations = {
            safe: {
                caller: "Mom",
                steps: [
                    { type: 'caller', text: "Hello? Hi dear, it's Mom." },
                    { type: 'ai-status', text: "AI: Background noise normal. Voice match: High correlation with 'Mom'." },
                    { type: 'caller', text: "I was just calling to check if you remember your cousin's wedding is this Saturday?" },
                    { type: 'ai-status', text: "AI: Conversational context detected. No fraud indicators." },
                    { type: 'caller', text: "Call me back when you have a minute. Love you, bye!" }
                ]
            },
            suspicious: {
                caller: "Microsoft Tech Support",
                steps: [
                    { type: 'caller', text: "Hello, I am calling from Microsoft Technical Support Department." },
                    { type: 'ai-status', text: "AI: Potential impersonation. Microsoft rarely initiates support calls." },
                    { type: 'caller', text: "We have detected a serious virus on your Windows computer that is stealing your files." },
                    { type: 'ai-status', text: "AI: Creating fear/panic. Suspicious claim." },
                    { type: 'caller', text: "To fix this, I need you to go to your computer and download a remote access tool so I can help you." },
                    { type: 'ai-status', text: "AI: Request for remote access. High risk indicator." }
                ]
            },
            fraud: {
                caller: "HDFC Bank Security",
                steps: [
                    { type: 'caller', text: "Urgent call from HDFC Bank Security. This is an automated alert." },
                    { type: 'ai-status', text: "AI: Automated urgency tactic detected." },
                    { type: 'caller', text: "Your debit card ending in 4592 has been used for a transaction of ₹45,000 at a jeweler in Dubai." },
                    { type: 'ai-status', text: "AI: High-value transaction claim. Financial pressure." },
                    { type: 'caller', text: "If you did not authorize this, press 1 now to speak with an agent. You will need to verify your PIN." },
                    { type: 'ai-status', text: "AI: Request for PIN via phone. DEFINITE FRAUD ATTEMPT." }
                ]
            }
        };
        return simulations[type] || simulations.safe;
    }
}

// Export for use in app.js
const fraudEngine = new FraudDetectionEngine();
