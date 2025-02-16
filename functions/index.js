import { Client } from "@elastic/elasticsearch";
import { https, firestore } from 'firebase-functions';
import { users } from './users.js';
//import { journals } from './journals.js';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '../secrets/.env' });

// Export HTTP functions
export const usersApi = https.onRequest(users);
//export const journalsApi = https.onRequest(journals);