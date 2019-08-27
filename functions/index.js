const { admin, db, functions } = require("./util/admin");

const express = require("express");
const app = express();
const FBAuth = require("./util/FBAuth");

const cors = require("cors");
app.use(cors());

app.post("/room/:roomCode/join", (req, res) => {
  // req.params.roomID
  console.log(JSON.stringify(req.body));
  console.log(req.params.roomCode);
  const name = req.body.name;
  let formatErrors = {};
  roomDoc = db.collection("rooms").doc(req.params.roomCode);
  if (name === undefined || name === "") {
    formatErrors.name = "Must enter valid name";
    return res.status(400).json(formatErrors);
  }
  let token = "";
  var promises = [];
  promises.push(admin.auth().createCustomToken(name)); //maybe name and roomcode??
  promises.push(roomDoc.get());
  return Promise.all(promises)
    .then(data => {
      token = data[0];
      doc = data[1];
      if (name in doc.data()) {
        formatErrors.name = "Must enter unique name";
      }
      if (Object.keys(formatErrors).length !== 0) {
        return res.status(400).json(formatErrors);
      }
      roomDoc.set({ [name]: null }, { merge: true });
      return res.status(200).json({ token });
    })
    .catch(err => {
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
    .catch(err => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);
