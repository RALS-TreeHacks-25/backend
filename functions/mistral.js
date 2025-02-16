import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../secrets/.env') });

async function askMistral(prompt) {
  const apiKey = process.env.MISTRAL_API_KEY;
  
  const client = new Mistral({apiKey: apiKey});
  
  const chatResponse = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{role: 'user', content: prompt}],
  });
  
  return chatResponse.choices[0].message.content;
}

module.exports = { askMistral }