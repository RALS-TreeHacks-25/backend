const express = require('express');
const cors = require('cors')
const admin = require('./firebase')

const { generateTitlePrompt, generateKeywordPhrasesPrompt, generateQuestionPrompt } = require('./prompts')


const { Client } = require('@elastic/elasticsearch')

const { createDoc } = require('./rag')

const journals = express()
journals.use(cors({origin: true}))

db = admin.firestore()

journals.post('/createJournal', async (req, res) => {
    /*
    req.body = {
        text: "text",
        user: "user",
    }
    res.body = {
        status: "success",
        ts: ISOstr,
        id: str,
        user: uidstr,
        title: str,
        text: str,
        annotations: [annotationsID]
    }
    */
    try {
        // completing the journal schema.
        let journal = req.body
        journal.ts = new Date().toISOString()
        journal.title = await askMistral(generateTitlePrompt + journal.text)
        journalDocument = await db.collection('journals').add(req.body)

        // throwing it inside the vector db
        createDoc(journalDocument.id, req.body.text)
        
        annotations = []

        // lets start the agentic workflows

        // getting connected entries:
        let keywordPhrasesString = await askMistral(generateKeywordPhrasesPrompt + journal.text)
        // Convert string response into array by parsing the string
        // Assuming the response is in the format: ['phrase1', 'phrase2', 'phrase3']
        let keywordPhrases = JSON.parse(keywordPhrasesString);

        for (let phrase of keywordPhrases) {
            connectedJournalId = await searchKeyPhrase(phrase, 0.9)
            if (connectedJournalId) {
                let connectedJournalDocument = await db.collection('journals').doc(connectedJournalId).get()
                annotations.push({
                    journalId: journalDocument.id,
                    content: connectedJournalDocument.id,
                    keyPhrase: phrase,
                    type: "connection"
                })
            }
        }

        // question generation annotations
        let question = await askMistral(generateQuestionPrompt + journal.text)
        question = JSON.parse(question)
        annotations.push({
            journalId: journalDocument.id,
            content: question.content,
            keyPhrase: question.keyPhrase,
            type: "question"
        })
    } catch(error) {
        console.error('Create error:', error);
        res.status(500).json(error)
    }
})

journals.get('/getJournals', async (req, res) => {
    try {
        keyPhrase = req.query.keyPhrase
        console.log("keyPhrase: ", keyPhrase)
        console.log("Elasticsearch endpoint:", process.env.ELASTIC_ENDPOINT)

        const client = new Client({
            node: process.env.ELASTIC_ENDPOINT,
            auth: {
                apiKey: process.env.ELASTIC_API_ENTRIES
            }
        });

        // First, generate embedding for the search phrase
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: keyPhrase,
                model: "text-embedding-3-small"
            })
        });

        const embeddingData = await embeddingResponse.json();
        const searchVector = embeddingData.data[0].embedding;

        console.log("Embedding response:", embeddingData);
        console.log("Search vector length:", searchVector.length);

        // Search for similar documents using vector similarity
        console.log("Executing Elasticsearch query...");
        const searchResponse = await client.search({
            index: "entries",
            body: {
                query: {
                    script_score: {
                        query: {
                            exists: {
                                field: "embedding"
                            }
                        },
                        script: {
                            source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                            params: { query_vector: searchVector }
                        }
                    }
                },
                size: 5  // Limit to top 5 most similar results
            }
        });

        console.log("Search response:", JSON.stringify(searchResponse, null, 2));
        console.log("Total hits:", searchResponse.hits.total);
        
        // Extract the matching documents
        const hits = searchResponse.hits.hits;
        console.log("Number of hits:", hits.length);
        
        const entries = hits.map(hit => ({
            ...hit._source,
            score: hit._score
        }));

        console.log("Processed entries:", entries);
        res.status(200).json(entries);
    } catch(error) {
        console.error('Search error:', error);
        res.status(500).json(error)
    }
})


exports.journals = journals