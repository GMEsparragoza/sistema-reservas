'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, query, where } from "firebase/firestore"
import { firestore } from '@/firebase/config';
import { guardarReserva } from '@/firebase/reservar';
import { PageUse } from '@/utils/Context';
import { handleSendEmail, handleDeleteEmail } from './send-email';
import { deleteReservation } from '@/firebase/deleteReservation';
import './date.css'; // Archivo CSS para estilos
import './formreserva.css'
import { DateTime } from "luxon";

export default function ReservationByDate({ date }) {
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [formReserva, setFormReserva] = useState(false);
    const [formCancel, setFormCancel] = useState(false);
    const [description, setDescription] = useState("");
    const [desc, setDesc] = useState("");
    const [unidadFuncional, setUnidadFuncional] = useState("");
    const [uf, setUF] = useState("");
    const [importe, setImporte] = useState(0);
    const [formHour, setFormHour] = useState("");
    const [formRoom, setFormRoom] = useState("");
    const [message, setMessage] = useState("");
    const [formattedTime, setFormattedTime] = useState("");
    const { email } = PageUse();

    const HandleFormReserva = (hour, room) => {
        setFormReserva(!formReserva);
        setFormHour(hour);
        setFormRoom(room);
        setImporte(room === "Rooftop" ? 50000 : 25000);
    }

    const HandleFormDelete = (hour, room, description, unitF) => {
        setFormCancel(!formCancel);
        setFormHour(hour);
        setFormRoom(room);
        setDesc(description);
        setUF(unitF)
    }

    const submitReserva = async () => {
        setLoading(true);
        setMessage("");
        await guardarReserva(description, formHour, date, formRoom, unidadFuncional, importe);
        await handleSendEmail(description, date, formHour, formRoom, unidadFuncional, importe, email);
        setLoading(false);
        setMessage("Reserva creada con exito");
        setTimeout(() => {
            window.location.reload(); // Recarga la página
        }, 500); // 500ms = 0.5 segundos
    }

    const cancelReservation = async () => {
        setLoading(true);
        setMessage("");
        await deleteReservation(date, formHour, formRoom);
        await handleDeleteEmail(date, formHour, formRoom, desc, uf, email);
        setLoading(false);
        setMessage("Reserva eliminada con exito");
        setTimeout(() => {
            window.location.reload(); // Recarga la página
        }, 500); // 500ms = 0.5 segundos
    }

    useEffect(() => {
        const argentinaTime = DateTime.now().setZone("America/Argentina/Buenos_Aires");
        setFormattedTime(argentinaTime);

        const fetchReservations = async () => {
            setError("");
            setLoading(true);
            setReservations([]);
            try {
                const correctedDate = date.split('-').reverse().join('-'); // Convierte 'DD-MM-YYYY' a 'YYYY-MM-DD'
                const [year, month, day] = correctedDate.split('-').map(Number);
                const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
                const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

                const reservationsRef = collection(firestore, 'reservas');
                const reservationsQuery = query(
                    reservationsRef,
                    where('date', '>=', startOfDay),
                    where('date', '<=', endOfDay)
                );

                const reservationsSnapshot = await getDocs(reservationsQuery);

                const reservas = reservationsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const timestamp = data.date.toDate(); // Convertir Timestamp a Date
                    return {
                        ...data,
                        date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
                        hour: `${timestamp.getUTCHours().toString().padStart(2, '0')}:${(timestamp.getMinutes() == 0) ? "00" : "30"}`
                    };
                });
                console.log(reservas);
                
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

    const roomButtonClass = (hour, room) => {
        const reservedHours = reservations.filter(res => res.room === room).map(res => res.hour);

        const isReserved = reservedHours.some(reservedHour => reservedHour === hour);
        const isWithinRange = reservedHours.some(reservedHour => {
            const [reservedH, reservedM] = reservedHour.split(":").map(Number);
            const [currentH, currentM] = hour.split(":").map(Number);
            const timeDifference = (currentH - reservedH) * 60 + (currentM - reservedM);
            return timeDifference > -90 && timeDifference <= 60;
        });

        const [day, month, year] = date.split("-");
        const buttonDate = new Date(year, month - 1, day, parseInt(hour.split(":")[0], 10), parseInt(hour.split(":")[1], 10));
        const isExpired = buttonDate < formattedTime;

        if (isReserved) return "reserved";
        if (isWithinRange || isExpired) return "expired";
        return "";
    };

    return (
        <>
            <div className={`${formReserva ? "formSection no-scroll " : "vanish"}`}>
                <div className="formBox">
                    <div className="formFather">
                        <div className="textForm"><b>Desea reservar esta sala?</b></div>
                        <div className="textForm">Fecha: {date}</div>
                        <div className="textForm">Hora: {formHour}</div>
                        <div className="textForm">Sala: {formRoom}</div>
                        <div className="textForm">Importe: ${importe}</div>
                        <div className="textForm">Email: {email}</div>
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder="Descripcion Reunion"
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                        />
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder="Unidad Funcional"
                            onChange={(e) => setUnidadFuncional(e.target.value)}
                            value={unidadFuncional}
                        />
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => {
                                HandleFormReserva("", "");
                                setDescription("");
                            }}>Cancelar</button>
                            <button className="submitReserva" onClick={() => submitReserva()}>Aceptar</button>
                        </div>
                        {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i> Guardando Reserva...</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </div>
                </div>
            </div>
            <div className={`${formCancel ? "formSection no-scroll " : "vanish"}`}>
                <div className="formBox">
                    <div className="formFather">
                        <div className="textForm"><b>Desea cancelar esta reserva?</b></div>
                        <div className="textForm">Fecha: {date}</div>
                        <div className="textForm">Hora: {formHour}</div>
                        <div className="textForm">Sala: {formRoom}</div>
                        <div className="textForm">Description: {desc}</div>
                        <div className="textForm">Unidad Funcional: {uf}</div>
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => {
                                HandleFormDelete("", "");
                            }}>Cancelar</button>
                            <button className="submitReserva" onClick={() => cancelReservation()}>Aceptar</button>
                        </div>
                        {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i> Eliminando Reserva...</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </div>
                </div>
            </div>
            <div className="reservation-page">
                <h1 className="reservationsTitle">Reservas para el {date}</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {loading && <p style={{ color: "white" }}>Cargando reservas...</p>}
                <div className="hours-container">
                    {Array.from({ length: 48 }).map((_, index) => {
                        const hour = `${Math.floor(index / 2).toString().padStart(2, '0')}:${index % 2 === 0 ? "00" : "30"}`;
                        const room1ButtonClass = roomButtonClass(hour, "1");
                        const room2ButtonClass = roomButtonClass(hour, "2");

                        // Obtener la fecha de la página (que ya está en formato DD-MM-YYYY)
                        const [day, month, year] = date.split("-");
                        // Busca si hay una reserva para Rooftop en la fecha actual
                        const room3Reserved = reservations.find(
                            res => res.room === "Rooftop"
                        );

                        const room3ButtonClass = (hour) => {
                            // Si no hay reservas en Rooftop, verifica si la hora ya expiró
                            if (!room3Reserved) {
                                const buttonDate = new Date(year, month - 1, day, parseInt(hour.split(":")[0], 10), parseInt(hour.split(":")[1], 10));
                                return buttonDate < formattedTime ? 'expired' : '';
                            }

                            // Si hay una reserva en Rooftop, marca la hora reservada como 'reserved' y las demás como 'expired'
                            return room3Reserved.hour === hour ? 'reserved' : 'expired';
                        };

                        return (
                            <div key={hour} className="hour-row">
                                <div className="hour">{hour}</div>
                                <div className="buttons">
                                    {hour >= "19" ? (<button
                                        className={`room-button ${room3ButtonClass(hour)}`}
                                        disabled={room3ButtonClass(hour) == 'expired'}
                                        onClick={() => {
                                            if (room3ButtonClass(hour) === 'reserved') {
                                                const des = room3Reserved.description;
                                                const unitF = room3Reserved.uf;
                                                HandleFormDelete(hour, "Rooftop", des, unitF);
                                            } else {
                                                HandleFormReserva(hour, "Rooftop");
                                            }
                                        }}
                                    >
                                        Rooftop
                                    </button>
                                    ) : ("")}
                                    <button
                                        className={`room-button ${room1ButtonClass}`}
                                        disabled={room1ButtonClass == "expired"}
                                        onClick={() => {
                                            if (room1ButtonClass === "reserved") {
                                                const reservation = reservations.find(res => res.hour === hour && res.room === "1");
                                                HandleFormDelete(hour, "1", reservation.description, reservation.uf);
                                            } else {
                                                HandleFormReserva(hour, "1");
                                            }
                                        }}
                                    >
                                        Sala 1
                                    </button>
                                    <button
                                        className={`room-button ${room2ButtonClass}`}
                                        disabled={room2ButtonClass == 'expired'}
                                        onClick={() => {
                                            if (room2ButtonClass === "reserved") {
                                                const reservation = reservations.find(res => res.hour === hour && res.room === "2");
                                                HandleFormDelete(hour, "2", reservation.description, reservation.uf);
                                            } else {
                                                HandleFormReserva(hour, "2");
                                            }
                                        }}
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
