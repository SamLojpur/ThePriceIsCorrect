const admin = require("firebase-admin");
const functions = require("firebase-functions");

var serviceAccount = require("../service-account.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

module.exports = { admin, db, functions };
