import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../secrets/.env') });

// Initialize Mistral client
const mistral = new Mistral(process.env.MISTRAL_API_KEY);

// Add the askMistral function
export async function askMistral(prompt) {
    try {
        const response = await mistral.chat.complete({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error calling Mistral API:', error);
        throw error;
    }
}