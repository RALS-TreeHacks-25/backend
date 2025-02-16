import admin from './firebase.js';

import { generateKeywordPhrasesPrompt, generateQuestionPrompt, generateEventPrompt } from './prompts.js';
import { Client } from '@elastic/elasticsearch';
import { createDoc, searchKeyPhrase } from './rag.js';
import { askMistral } from './mistral.js';

const db = admin.firestore();

async function getJournals(user) {
    try {
        let journals = await db.collection('journals').where('user', '==', user).get();
        let journalsArray = [];
        journals.forEach(journal => {
            journalsArray.push(journal.data());
        });
        return journalsArray;
    }
    catch (error) {
        console.log("error with getting journals");
        console.log(error);
    }
}

// creates a string with all previous journal entries
export async function preprocessJournalsLLM(userId) {
    const journals = await getJournals(userId);
    // between each journal should be the title of the entry as well
    const journalString = journals.map(journal => `${journal.title}\n${journal.text}`).join("\n\n");
    return journalString;
}