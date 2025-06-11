// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ✅ Configuración oficial de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpSYEdfUpxexKjl_Pw6xj76ynl-ynFNI0",
  authDomain: "rq-market.firebaseapp.com",
  projectId: "rq-market",
  storageBucket: "rq-market.appspot.com", // 👈 Bucket correcto para Storage
  messagingSenderId: "294451555920",
  appId: "1:294451555920:web:91b7d197db4666be786b55",
  measurementId: "G-N02V0H39CF"
};

// ✅ Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Servicios principales de Firebase
const db = getFirestore(app);         // Firestore (base de datos)
const auth = getAuth(app);            // Autenticación
const storage = getStorage(app, "gs://rq-market.firebasestorage.app");

// ✅ Exportamos los servicios
export { db, auth, storage };
