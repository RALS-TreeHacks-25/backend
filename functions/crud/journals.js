const express = require('express');
const cors = require('cors')
const admin = require('../firebase')

const journals = express()
journals.use(cors({origin: true}))

db = admin.firestore()


journals.post('/createJournal', async (req, res) => {
    try{
        console.log("hello", req.body)
        await db.collection('journals').add(req.body)
        res.status(200).json({message: "entry created on firestore successfully!"})
        
        const client = new Client({
            node: process.env.ELASTIC_ENDPOINT,
            auth: {
                apiKey:{
                    id: "entries",
                    api_key: process.env.ELASTIC_API_ENTRIES
                }
            }
        });
        const response = await client.index({
            index: "entries",
            document: req.body,
        });
        console.log("response: ", response)

    } catch(error){
        res.status(500).json(error)
    }
})



exports.journals = journals