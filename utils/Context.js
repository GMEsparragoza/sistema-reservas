"use client"

import { useContext, createContext, useState, useEffect } from "react";

const PageContext = createContext();

export const PageContextProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [meetings, setMeetings] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReservations() {
            setError("");
            setLoading(true);
            try {
                const response = await fetch('/api/reservations');
                const data = await response.json();
                setMeetings(data);
                setLoading(false);
            } catch (error) {
                setError("Error al obtener las reuniones");
                setLoading(false);
            }
        }

        fetchReservations();
    }, []);

    return (
        <PageContext.Provider value={{ loading, error, meetings }}>
            {children}
        </PageContext.Provider>
    );
}

export const PageUse = () => {
    return useContext(PageContext);
};