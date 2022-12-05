import { initializeApp } from 'firebase/app';
import "../app.css";

export function load() {
  if (import.meta.env.VITE_firebaseConfig) {
    initializeApp(JSON.parse(import.meta.env.VITE_firebaseConfig));
  } else {
    initializeApp(JSON.parse(atob(import.meta.env.VITE_firebaseConfigEnc)));
  }
}