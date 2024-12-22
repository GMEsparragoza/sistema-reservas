'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, query, where } from "firebase/firestore"
import { firestore } from '@/firebase/config';
import './date.css'; // Archivo CSS para estilos
import './formreserva.css'

export default function ReservationByDate({ date }) {
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [formReserva, setFormReserva] = useState(false);
    const [title, setTitle] = useState("");
    const [formHour, setFormHour] = useState("");
    const [formRoom, setFormRoom] = useState(0);

    const HandleFormReserva = (hour, room) => {
        setFormReserva(!formReserva);
        setFormHour(hour);
        setFormRoom(room);
    }

    // Simula la obtención de datos desde Firebase (lógica real por implementar)
    useEffect(() => {
        const fetchReservations = async () => {
            setError("");
            setLoading(true);
            try {
                // Convertir la fecha a un rango de timestamps
                const correctedDate = date.split('-').reverse().join('-'); // Convierte 'DD-MM-YYYY' a 'YYYY-MM-DD'
                // Dividir y construir la fecha en UTC
                const [year, month, day] = correctedDate.split('-').map(Number); // 'YYYY-MM-DD'
                const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
                const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

                // Hacer la consulta a Firestore
                const reservationsRef = collection(firestore, 'reservas');
                const reservationsQuery = query(
                    reservationsRef,
                    where('date', '>=', startOfDay),
                    where('date', '<=', endOfDay)
                );

                const reservationsSnapshot = await getDocs(reservationsQuery);

                // Mapear los resultados
                const reservations = reservationsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const timestamp = data.date.toDate(); // Convertir Timestamp a Date
                    return {
                        ...data,
                        date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
                        hour: `${timestamp.getUTCHours().toString().padStart(2, '0')}:00`
                    };
                });
                setReservations(reservations);
                setLoading(false);
            } catch (err) {
                setError('Error al obtener reservas');
                console.error(err);
                setLoading(false);
            }
        };
        fetchReservations();
    }, [date]);

    return (
        <>
            <div className={`${formReserva ? "formSection no-scroll " : "vanish"}`}>
                <div className="formBox">
                    <div className="formFather">
                        <div className="textForm"><b>Desea reservar una reunion?</b></div>
                        <div className="textForm">Fecha: {date}</div>
                        <div className="textForm">Hora: {formHour}</div>
                        <div className="textForm">Sala: {formRoom}</div>
                        <input type="text" className="inputTitle" placeholder="Titulo Reunion" onChange={(e) => setTitle(e.target.value)} />
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => HandleFormReserva("", 0)}>Cancelar</button>
                            <button className="submitReserva" onClick={() => submit()}>Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="reservation-page">
                <h1>Reservas para el {date}</h1>
                <div className="hours-container">
                    {Array.from({ length: 24 }).map((_, index) => {
                        const hour = `${index.toString().padStart(2, '0')}:00`;
                        const room1Reserved = reservations.find(
                            res => res.hour === hour && res.room == '1'
                        );
                        const room2Reserved = reservations.find(
                            res => res.hour === hour && res.room == '2'
                        );

                        return (
                            <div key={hour} className="hour-row">
                                <div className="hour">{hour}</div>
                                <div className="buttons">
                                    <button
                                        className={`room-button ${room1Reserved ? 'reserved' : ''}`}
                                        disabled={room1Reserved}
                                        onClick={() => HandleFormReserva(hour, 1)}
                                    >
                                        Sala 1
                                    </button>
                                    <button
                                        className={`room-button ${room2Reserved ? 'reserved' : ''}`}
                                        disabled={room2Reserved}
                                        onClick={() => HandleFormReserva(hour, 2)}
                                    >
                                        Sala 2
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {loading && <p style={{ color: "red" }}>Cargando reservas...</p>}
            </div>
        </>
    );
}
