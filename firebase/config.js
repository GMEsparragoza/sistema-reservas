// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDaNa8v-ZjcJBAvxqrERoMBYbEiWQOozxI",
    authDomain: "sistema-reservas-78765.firebaseapp.com",
    projectId: "sistema-reservas-78765",
    storageBucket: "sistema-reservas-78765.firebasestorage.app",
    messagingSenderId: "229898762878",
    appId: "1:229898762878:web:1328fb237a35100a7f362f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app, firestore };