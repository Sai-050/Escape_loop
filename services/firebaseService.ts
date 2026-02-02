import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GameStats } from "../types";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVfrvtdzx35xeF3-3ZWm8hiUOV7OJSBj4",
  authDomain: "escape-loop-3e499.firebaseapp.com",
  projectId: "escape-loop-3e499",
  storageBucket: "escape-loop-3e499.firebasestorage.app",
  messagingSenderId: "989779022173",
  appId: "1:989779022173:web:07830cd3ae212b32aa98b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveGameResult = async (playerName: string, stats: GameStats) => {
  try {
    if (!playerName) return; // Don't save if no name provided

    await addDoc(collection(db, "users"), {
      name: playerName,
      score: stats.score,
      level: stats.level,
      timestamp: serverTimestamp(),
      questionsAnswered: stats.questionsAnswered,
      surrendered: stats.surrendered,
      timeElapsed: stats.timeElapsed
    });
    console.log("Document written with ID: ", playerName);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
