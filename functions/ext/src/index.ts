import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Server A: Triggered via HTTP request to simulate live input
export const inputServer = functions.https.onRequest(async (req, res) => {
  const data = req.body;

  if (!data.input) {
    res.status(400).send("Missing input");
    return;
  }

  await db.collection("liveData").add({
    input: data.input,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("Input stored from Server A:", data.input);
  res.send("Input received and stored.");
});

// Server B: Reacts to new input from Server A
export const responderServer = functions.firestore
  .document("liveData/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    if (!data) {
      console.warn("No data in snapshot.");
      return;
    }

    console.log("Server B received input:", data.input);

    await db.collection("responses").add({
        response: `Server B processed input: ${data.input}`,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  });
