import express from 'express';
import cors from 'cors';
import admin from './firebase.js';
import { user } from 'firebase-functions/v1/auth';
import { getUserBrainstormPrompt } from './llmPreprocess.js';
import { askMistral } from './mistral.js';

const users = express()
users.use(cors({origin: true}))

const db = admin.firestore()

users.post('/createUser', async (req, res) => {
    try{
        await db.collection('users').doc(req.body.uid).set(req.body)
        res.status(200).json({message: "user created successfully!"})
    } catch(error){
        res.status(500).json(error)
    }
})

// Read all the users
users.get('/getUsers', (req, res) => {
  db.collection('users').get()
    .then(snapshot => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      res.status(200).json(items);
    })
    .catch(error => res.status(500).json({ error: error.message }));
});

// Read a single user
users.post('/getUser/', (req, res) => {
  const itemId = req.body.uid;
  db.collection('users').doc(itemId).get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ error: 'Item not found' });
      } else {
        res.status(200).json({ id: doc.id, ...doc.data() });
      }
    })
    .catch(error => res.status(500).json({ error: error.message }));
});

// Update a single user
users.post('/updateUser', (req, res) => {
  const itemId = req.body.user.uid;
  const updatedItem = req.body.user;
  console.log("Reached users REST API!")
  console.log(updatedItem)
  console.log(itemId)
  db.collection('users').doc(itemId).update(updatedItem)
    .then(() => res.status(200).json({ message: 'Item updated successfully' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Delete a single user
users.delete('/deleteUser', (req, res) => {
  const itemId = req.body.uid;
  db.collection('users').doc(itemId).delete()
    .then(() => res.status(200).json({ message: 'Item deleted successfully' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

users.get("/getUsersCarousel/", async (req, res) => {
  try{
  const prompt = await getUserBrainstormPrompt(req.query.user);
  console.log("prompt: ", prompt);
  const response = await askMistral(prompt);
  console.log("response: ", response);
  const prompts = JSON.parse(response);
  console.log("prompts: ", prompts);
  res.status(200).json(prompts);
  } catch(error){
    res.status(500).json(error);
  }
});

export { users }