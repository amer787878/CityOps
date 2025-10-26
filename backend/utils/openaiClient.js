const OpenAI = require('openai');
const fs = require('fs');

// Initialize the OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure the API key is set in your environment
});

/**
 * Classify an audio file into a category and priority level.
 * @param {string} audioPath - The path to the audio file.
 * @returns {Promise<{ transcription: string, category: string, priority: string }>}.
 */
const classifyIssue = async (audioPath) => {

    try {
        const audioFile = fs.createReadStream(audioPath);

        // Step 1: Transcription using OpenAI Whisper
        const transcriptionResponse = await client.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "en",
        });
        const transcription = transcriptionResponse.text.trim();

        // Step 2: Classification using gpt-4
        const messages = [
            {
                role: 'system',
                content: `You are an assistant that classifies urban issues and assigns priority levels.`,
            },
            {
                role: 'user',
                content: `
                    Classify the following issue into one of these categories:
                    Road Maintenance, Waste Disposal, Streetlight Maintenance, or Other.
                    Assign a priority level: Critical, Moderate, or Low.

                    Issue: "${transcription}"

                    Respond in JSON format:
                    {
                      "category": "<Category>",
                      "priority": "<Priority>"
                    }
                `,
            },
        ];

        const classificationResponse = await client.chat.completions.create({
            model: "gpt-4", // Use gpt-4
            messages,
            max_tokens: 100,
        });

        // Parse the JSON response from OpenAI
        let classification;
        try {
            classification = JSON.parse(classificationResponse.choices[0].message.content.trim());
        } catch (jsonError) {
            throw new Error("Failed to parse OpenAI classification response.");
        }

        // Return combined transcription and classification
        return {
            transcription,
            category: classification.category || "Other",
            priority: classification.priority || "Moderate",
        };
    } catch (error) {
        console.error("Error processing audio classification:", error.message);
        throw new Error("Failed to classify the issue.");
    }
};

module.exports = { classifyIssue };
