import fs from "fs";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const rawConfig = fs.readFileSync("firebase-applet-config.json", "utf8");
const firebaseConfig = JSON.parse(rawConfig);

const app = initializeApp({
  projectId: firebaseConfig.projectId
});
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);


const dbPath = "foods-db.json";
if (fs.existsSync(dbPath)) {
  const content = fs.readFileSync(dbPath, "utf-8");
  const initialFoods = JSON.parse(content);
  Promise.all(initialFoods.map((food: any) => db.doc(`foods/${food.id}`).set(food)))
    .then(() => console.log("Seeding complete"))
    .catch(console.error);
}

