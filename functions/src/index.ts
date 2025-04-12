import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

interface InputData {
  input: string;
}

export const inputServer = functions.https.onRequest(async (req, res) => {
  const data: InputData = req.body;
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

export const responderServer = functions.firestore
  .document("liveData/{docId}")
  .onCreate(async (snap, context) => {
    const rawData = snap.data();

    if (!rawData || typeof rawData.input !== "string") {
      console.warn("Invalid or missing 'input' in Firestore document:", rawData);
      return;
    }

    const data: InputData = {
      input: rawData.input,
    };

    console.log("Server B received input:", data.input);

    await db.collection("responses").add({
      response: `Server B processed input: ${data.input}`,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });