/**
 * Import function triggers from their respective submodules.
 * See supported triggers: https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Server A: Triggered via HTTP request to simulate live input
export const inputServer = onRequest(async (req, res) => {
  const data = req.body;

  if (!data.input) {
    res.status(400).send('Missing input');
    return;
  }

  await db.collection('liveData').add({
    input: data.input,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  logger.info("Input stored from Server A", { input: data.input });
  res.send('Input received and stored.');
});

// Server B: Reacts to new input from Server A
export const responderServer = onDocumentCreated('liveData/{docId}', async (event) => {
  const snap = event.data;

  if (!snap) {
    logger.warn("No Firestore snapshot found.");
    return;
  }

  const data = snap.data();
  logger.info("Server B received input", data);

  await db.collection('responses').add({
    response: `Server B processed input: ${data.input}`,
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});