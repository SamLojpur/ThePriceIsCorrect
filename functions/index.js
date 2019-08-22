const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

// const database = admin.database().ref("/items");

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

app.post("/room/:roomCode/join", (req, res) => {
  // req.params.roomID
  console.log(JSON.stringify(req.body));
  console.log(req.params.roomCode);
  const name = req.body.name;
  db.collection("rooms")
    .doc(req.params.roomCode)
    .update({ [name]: null })
    .then(doc => {
      console.log(doc);
      res.status(200).json(req.body);
      return doc;
    })
    .catch(() => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.code });
      }
    });
});

app.get("/room/:roomCode", (req, res) => {
  db.collection("rooms")
    .doc(req.params.roomCode)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json("Error: No such room");
      } else {
        console.log("Document data:", doc.data());
        return res.json(doc.data());
      }
    })
    .catch(() => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);
