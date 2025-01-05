"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { firestore } from "@/firebase/config";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export const Reservations = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReservations() {
            setError("");
            setLoading(true);

            const reservations = [];

            const now = new Date();
            now.setHours(now.getHours() - 3); // Resta 3 horas para ajustarlo a UTC-3
            try {
                // Consulta las reservas con fecha >= ahora, ordenadas por fecha ascendente
                const reservationsQuery = query(
                    collection(firestore, "reservas"),
                    where("date", ">=", now),
                    orderBy("date", "asc"), // Ordenar por fecha ascendente
                    limit(5) // Limitar a un máximo de 5 resultados
                );

                const reservationsSnap = await getDocs(reservationsQuery);

                reservationsSnap.docs.forEach((doc) => {
                    const data = doc.data();
                    const timestamp = data.date.toDate();

                    reservations.push({
                        id: doc.id,
                        room: data.room,
                        description: data.description,
                        uf: data.uf,
                        date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
                        time: `${timestamp.getUTCHours().toString().padStart(2, '0')}:${(timestamp.getMinutes() == 0) ? "00" : "30"}`
                    });
                });
                setMeetings(reservations);
            } catch (error) {
                console.error("Error al obtener las reservaciones:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchReservations();
    }, []);

    return (
        <>
            {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i>Cargando Reservas...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="container">
                <h1 className="title">Próximas Reuniones</h1>
                {meetings.length > 0 ? (
                    <ul className="list">
                        {meetings.map((meeting, id) => (
                            <li key={id} className="card">
                                <h2 className="meetingTitle">{meeting.description}</h2>
                                <p className="meetingInfo">
                                    <b>Fecha:</b> {meeting.date}<br />
                                    <b>Hora:</b> {meeting.time} <br />
                                    <b>Sala:</b> {meeting.room} <br />
                                    <b>Unidad Funcional:</b> {meeting.uf} 
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="emptyState">
                        <p className="message">
                            No hay reuniones programadas. ¡Reserva una ahora!
                        </p>
                        <Link href="/reservations">
                            <button className="button">Ir a Reservas</button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}
