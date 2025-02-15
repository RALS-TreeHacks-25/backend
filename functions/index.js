const { Client } = require("@elastic/elasticsearch");

const functions = require('firebase-functions');
const users = require('./crud/users')
const journals = require('./crud/journals')

exports.users = functions.https.onRequest(users.users)
exports.journals = functions.https.onRequest(journals.journals)

// IGNORE THIS

require('dotenv').config({ path: '../secrets/.env' });

// Initialize Elastic, requires installing Elastic dependencies:
// https://github.com/elastic/elasticsearch-js
//
// ID, username, and password are stored in functions config variables


console.log("hello world", process.env.ELASTIC_ENDPOINT)

const client = new Client({
    node: process.env.ELASTIC_ENDPOINT,
    auth: {
        apiKey:{
            id: "entries",
            api_key: process.env.ELASTIC_API_ENTRIES
        }
    }
});


// Update the search index every time a blog post is written.
exports.onEntryCreated = functions.firestore.document('entries/{uid}').onCreate(async (snap, context) => {
  // Get the note document
  console.log("detected entry created")
  const note = snap.data();

  // Use the 'nodeId' path segment as the identifier for Elastic
  const id = context.params.uid;
  console.log("id: ", id)
  console.log("body: ", note)
  // Write to the Elastic index
  response = await client.index({
    index: "entries",
    id,
    body: note,
  });
  
  console.log("reached end of onEntryCreated!")
});

// Elastic search full-text search. TODO: replace this with vector search. 
exports.searchNotes = functions.https.onCall(async (data, context) => {
  const query = data.query;

  // Search for any notes where the text field contains the query text.
  // For more search examples see:
  // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/search_examples.html
  const searchRes = await client.search({
    index: "entries",
    body: {
      query: {
        query_string: {
          query: `*${query}*`,
          fields: [
            "text"
          ]
        }
      }
    }
  });

  // Each entry will have the following properties:
  //   _score: a score for how well the item matches the search
  //   _source: the original item data
  const hits = searchRes.body.hits.hits;

  const notes = hits.map(h => h["_source"]);
  return {
    notes: notes
  };
});