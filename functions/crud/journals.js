const express = require('express');
const cors = require('cors')
const admin = require('../firebase')
const { Client } = require('@elastic/elasticsearch')

const journals = express()
journals.use(cors({origin: true}))

db = admin.firestore()


journals.post('/createJournal', async (req, res) => {
    try {
        await db.collection('journals').add(req.body)

        console.log("Request body:", req.body); // Log the incoming request

        // Generate embedding for the journal entry
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: req.body.text, // assuming your journal entry has a content field
                model: "text-embedding-3-small"
            })
        });

        const embeddingData = await embeddingResponse.json();
        console.log("OpenAI API response:", embeddingData); // Log the OpenAI response

        // Check if we have a valid response
        if (!embeddingData.data || !embeddingData.data[0]) {
            console.error('Invalid embedding response:', embeddingData);
            return res.status(400).json({ 
                error: 'Failed to generate embedding',
                details: embeddingData
            });
        }

        const documentWithEmbedding = {
            ...req.body,
            embedding: embeddingData.data[0].embedding
        };
        
        // Elasticsearch operation
        const client = new Client({
            node: process.env.ELASTIC_ENDPOINT,
            auth: {
                apiKey: process.env.ELASTIC_API_ENTRIES
            }
        });
        const response = await client.index({
            index: "entries",
            document: documentWithEmbedding,
        });

        res.status(200).json({message: "entry created successfully!"})
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