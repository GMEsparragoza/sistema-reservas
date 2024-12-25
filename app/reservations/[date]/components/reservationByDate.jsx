'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, query, where } from "firebase/firestore"
import { firestore } from '@/firebase/config';
import { guardarReserva } from '@/firebase/reservar';
import { PageUse } from '@/utils/Context';
import { handleSendEmail } from './send-email';
import './date.css'; // Archivo CSS para estilos
import './formreserva.css'
import { DateTime } from "luxon";

export default function ReservationByDate({ date }) {
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [formReserva, setFormReserva] = useState(false);
    const [title, setTitle] = useState("");
    const [formHour, setFormHour] = useState("");
    const [formRoom, setFormRoom] = useState(0);
    const [message, setMessage] = useState("");
    const [formattedTime, setFormattedTime] = useState("");
    const { email } = PageUse();

    const HandleFormReserva = (hour, room) => {
        setFormReserva(!formReserva);
        setFormHour(hour);
        setFormRoom(room);
    }

    const submitReserva = async () => {
        setLoading(true);
        setMessage("");
        await guardarReserva(title, formHour, date, formRoom);
        await handleSendEmail(title, date, formHour, formRoom, email);
        setLoading(false);
        setMessage("Reserva creada con exito");
        setTimeout(() => {
            window.location.reload(); // Recarga la página
        }, 500); // 500ms = 0.5 segundos
    }

    // Simula la obtención de datos desde Firebase (lógica real por implementar)
    useEffect(() => {
        const argentinaTime = DateTime.now().setZone("America/Argentina/Buenos_Aires");
        setFormattedTime(argentinaTime);

        const fetchReservations = async () => {
            setError("");
            setLoading(true);
            setReservations([]);
            try {
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
                const reservas = reservationsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const timestamp = data.date.toDate(); // Convertir Timestamp a Date
                    return {
                        ...data,
                        date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
                        hour: `${timestamp.getUTCHours().toString().padStart(2, '0')}:00`
                    };
                });
                setReservations(reservas);
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
                        <div className="textForm">Email: {email}</div>
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder="Titulo Reunion"
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                        />
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => {
                                HandleFormReserva("", 0);
                                setTitle("");
                            }}>Cancelar</button>
                            <button className="submitReserva" onClick={() => submitReserva()}>Aceptar</button>
                        </div>
                        {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i> Guardando Reserva...</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </div>
                </div>
            </div>
            <div className="reservation-page">
                <h1 className="reservationsTitle">Reservas para el {date}</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {loading && <p style={{ color: "white" }}>Cargando reservas...</p>}
                <div className="hours-container">
                    {Array.from({ length: 24 }).map((_, index) => {
                        const hour = `${index.toString().padStart(2, '0')}:00`;
                        // Obtener la fecha de la página (que ya está en formato DD-MM-YYYY)
                        const [day, month, year] = date.split("-");

                        // Comprobar si la reserva existe en la base de datos
                        const room1Reserved = reservations.find(
                            res => res.hour === hour && res.room == '1'
                        );
                        const room2Reserved = reservations.find(
                            res => res.hour === hour && res.room == '2'
                        );


                        const buttonDate = new Date(year, month - 1, day, index, 0); // Crear un Date para comparar con la fecha actual

                        // Verificar si la fecha-hora del botón ya pasó en relación con la fecha y hora actual
                        const isExpired = buttonDate < formattedTime; // Si la fecha-hora es menor a la fecha actual, está expirado

                        // Lógica para las clases
                        const room1ButtonClass = room1Reserved ? 'reserved' : isExpired ? 'expired' : '';
                        const room2ButtonClass = room2Reserved ? 'reserved' : isExpired ? 'expired' : '';

                        return (
                            <div key={hour} className="hour-row">
                                <div className="hour">{hour}</div>
                                <div className="buttons">
                                    <button
                                        className={`room-button ${room1ButtonClass}`}
                                        disabled={room1Reserved || isExpired}
                                        onClick={() => HandleFormReserva(hour, 1)}
                                    >
                                        Sala 1
                                    </button>
                                    <button
                                        className={`room-button ${room2ButtonClass}`}
                                        disabled={room2Reserved || isExpired}
                                        onClick={() => HandleFormReserva(hour, 2)}
                                    >
                                        Sala 2
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
