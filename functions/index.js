const { admin, db, functions } = require("./util/admin");

const express = require("express");
const app = express();
const FBAuth = require("./util/FBAuth");

const cors = require("cors");
app.use(cors());

app.post("/room/:roomCode/join", FBAuth, (req, res) => {
  let formatErrors = {};
  roomDoc = db.collection("rooms").doc(req.params.roomCode);
  const { name } = req.body;
  if (name === undefined || name === "") {
    formatErrors.name = "Must enter valid name";
    return res.status(400).json(formatErrors);
  }
  var promises = [];
  promises.push(
    admin
      .auth()
      .createCustomToken(
        JSON.stringify({ roomCode: req.params.roomCode, name: name })
      )
  );
  promises.push(roomDoc.get());
  return Promise.all(promises)
    .then(data => {
      token = data[0];
      doc = data[1];
      let userData = {
        answer: "",
        guess: "",
        image: "",
        is_leader: false,
        order: -1
      };
      if (doc.exists) {
        if (name in doc.data()) {
          if (req.name !== name) {
            formatErrors.name = "Must enter unique name";
          }
        }
      } else {
        userData.is_leader = true;
      }
      if (Object.keys(formatErrors).length !== 0) {
        return res.status(400).json(formatErrors);
      }
      roomDoc.set(
        {
          [name]: userData
        },
        { merge: true }
      );
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

app.post("/room/:roomCode/start", FBAuth, (req, res) => {
  let { name, roomCode } = req;
  if (roomCode !== req.params.roomCode) {
    return res.status(400).json({ error: "Player validated for wrong room" });
  }
  db.collection("rooms")
    .doc(req.params.roomCode)
    .get()
    .then(doc => {
      leader = doc.data()[name];

      if (!doc.exists) {
        return res.status(400).json({ error: "No room to start" });
      }
      if (leader.is_leader !== true) {
        return res
          .status(400)
          .json({ error: "Player other than room leader cannot start game" });
      }
      let order = [...Array(Object.keys(doc.data()).length).keys()];

      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      let snapshot = {};
      for (var player in doc.data()) {
        snapshot[player] = { order: order.pop() };
      }
      db.collection("rooms")
        .doc(req.params.roomCode)
        .set(snapshot, { merge: true });
      return res.status(200).json(snapshot);
    })
    .catch(err => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);
