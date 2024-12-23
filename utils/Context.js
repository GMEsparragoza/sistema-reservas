"use client"

import { useContext, createContext, useState, useEffect } from "react";
import { getDoc, getDocs, collection, query, doc, limit, updateDoc } from "firebase/firestore"
import { firestore } from "@/firebase/config";

const PageContext = createContext();

export const PageContextProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [meetings, setMeetings] = useState([]);
    const [error, setError] = useState("");
    const [email, setEmail] = useState('');

    const updateEmail = async (newEmail) => {
        setError("");  // Limpiar cualquier error previo
        try {
            // Obtener una referencia a la colección 'email' y limitar a 1 documento
            const emailCollectionRef = collection(firestore, "email");
            const q = query(emailCollectionRef, limit(1));
    
            // Obtener el primer documento de la colección
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                // Tomamos el primer documento
                const firstDoc = querySnapshot.docs[0];
                const docRef = doc(firestore, "email", firstDoc.id); // Usamos el ID del primer documento
    
                // Actualizamos el campo 'email' en ese documento
                await updateDoc(docRef, {
                    email: newEmail
                });
    
                console.log("Email actualizado correctamente.");
            } else {
                setError("No se encontró el documento para actualizar.");
                console.error("No se encontró ningún documento en la colección 'email'.");
            }
        } catch (error) {
            setError("Error al actualizar el email.");
            console.error("Error:", error);
        }
    }

    useEffect(() => {
        const getEmail = async () => {
            setError("");
            try {
                const userDocRef = doc(firestore, 'email', "0");
                const userSnap = await getDoc(userDocRef);

                const userData = userSnap.data();
                // Verifica que userData.email sea una cadena antes de usarla
                if (typeof userData.email === "string" && userSnap.exists()) {
                    setEmail(userData.email);
                } else {
                    setEmail(""); // Si no es una cadena, establecemos un valor vacío
                    console.error("El valor de 'email' no es una cadena válida.");
                }

            } catch (error) {
                console.error('Error:', error);
            }
        }

        async function fetchReservations() {
            setError("");
            setLoading(true);
            try {
                const reservationsQuery = query(
                    collection(firestore, 'reservas')
                );
                const reservationsSnap = await getDocs(reservationsQuery);

                const reservations = [];
                reservationsSnap.forEach((doc) => {
                    const fecha = doc.data().date.toDate(); // Convierte el Timestamp a un objeto Date
                    const formattedDate = fecha.toLocaleDateString();
                    const formattedTime = fecha.toLocaleTimeString();
                    reservations.push({
                        id: doc.id,
                        room: doc.data().room,
                        title: doc.data().title,
                        date: formattedDate,
                        time: formattedTime
                    });
                });
                setMeetings(reservations);
            } catch (err) {
                console.error(err)
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }

        fetchReservations();
        getEmail();
    }, []);

    return (
        <PageContext.Provider value={{ loading, error, meetings, email, updateEmail }}>
            {children}
        </PageContext.Provider>
    );
}

export const PageUse = () => {
    return useContext(PageContext);
};