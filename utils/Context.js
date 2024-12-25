"use client"

import { useContext, createContext, useState, useEffect } from "react";
import { getDoc, getDocs, collection, query, doc, updateDoc, setDoc } from "firebase/firestore"
import { firestore } from "@/firebase/config";

const PageContext = createContext();

export const PageContextProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState('');

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const sendVerificationEmail = async (email, verificationCode) => {
        const result = await fetch('/api/sendConfirmationEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                subject: 'Verificación de correo',
                html: `
                    <p>Para confirmar tu correo electrónico, ingresa el siguiente código:</p>
                    <h2><b>${verificationCode}</b></h2>
                `,
            }),
        });
        console.log(result);
    };

    const verifyEmail = async (newEmail) => {
        setError("");
        // Validar formato del correo
        if (!isValidEmail(newEmail)) {
            setError("El correo ingresado no tiene un formato válido.");
            return;
        }
        //Mail de verificacion para validar la nueva direccion de correo electronico
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
        await sendVerificationEmail(newEmail, verificationCode);
        return verificationCode;
    }

    const updateEmail = async (newEmail) => {
        setError(""); // Limpiar cualquier error previo

        try {
            // Referencia al documento específico con ID "0" en la colección 'email'
            const emailDocRef = doc(firestore, "email", "0");

            // Verificar si el documento existe
            const docSnapshot = await getDoc(emailDocRef);

            if (docSnapshot.exists()) {
                // Si el documento existe, actualizar el email
                await updateDoc(emailDocRef, {
                    email: newEmail,
                    updatedAt: new Date(), // Opcional: Timestamp de actualización
                });

                console.log("Email actualizado correctamente.");
            } else {
                // Si el documento no existe, crearlo con el ID "0"
                await setDoc(emailDocRef, {
                    email: newEmail,
                    createdAt: new Date(), // Timestamp de creación
                });

                console.log("Email insertado correctamente.");
            }
        } catch (error) {
            if (error.code === "permission-denied") {
                setError("No tienes permiso para acceder o modificar los datos.");
            } else if (error.code === "unavailable") {
                setError("El servicio de Firestore no está disponible. Inténtalo más tarde.");
            } else {
                setError("Error al interactuar con la base de datos.");
            }
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
                if (userSnap.exists()) {
                    setEmail(userData.email);
                } else {
                    setEmail("No hay email Registrado"); // Si no es una cadena, establecemos un valor vacío
                }

            } catch (error) {
                console.error('Error:', error);
            }
        }

        getEmail();
    }, []);

    return (
        <PageContext.Provider value={{ loading, error, email, updateEmail, verifyEmail }}>
            {children}
        </PageContext.Provider>
    );
}

export const PageUse = () => {
    return useContext(PageContext);
};