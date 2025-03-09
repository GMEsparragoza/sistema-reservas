'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, query, where } from "firebase/firestore"
import { firestore } from '@/firebase/config';
import { guardarReserva, verificarReservasMismaUF } from '@/firebase/reservar';
import { PageUse } from '@/utils/Context';
import { handleSendEmail, handleDeleteEmail, handleModifyEmail } from './send-email';
import { deleteReservation, updateReservation } from '@/firebase/manejarReservas';
import './date.css'; // Archivo CSS para estilos
import './formreserva.css'
import { DateTime } from "luxon";

export default function ReservationByDate({ date }) {
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [formReserva, setFormReserva] = useState(false);
    const [formCancel, setFormCancel] = useState(false);
    const [formModificar, setFormModificar] = useState(false);
    const [formConfirmarReserva, setFormConfirmarReserva] = useState(false);
    const [description, setDescription] = useState("");
    const [desc, setDesc] = useState("");
    const [unidadFuncional, setUnidadFuncional] = useState("");
    const [uf, setUF] = useState("");
    const [importe, setImporte] = useState(0);
    const [formHour, setFormHour] = useState("");
    const [turnoShift, setTurnoShift] = useState(null)
    const [formRoom, setFormRoom] = useState("");
    const [message, setMessage] = useState("");
    const [formattedTime, setFormattedTime] = useState("");
    const { email } = PageUse();

    const HandleFormReserva = (turno, room) => {
        setFormReserva(!formReserva);
        if (room === "Rooftop") {
            if (turno === 1) {
                setFormHour("09:00 a 12:00");
            } else {
                if (turno === 2) {
                    setFormHour("14:00 a 17:00");
                } else {
                    if (turno === 3) {
                        setFormHour("19:00 a 22:00");
                    }
                }
            }
        } else {
            if (turno === 1) {
                setFormHour("08:30 a 10:30");
            } else {
                if (turno === 2) {
                    setFormHour("11:00 a 13:00");
                } else {
                    if (turno === 3) {
                        setFormHour("13:30 a 15:30");
                    }
                    else {
                        if (turno === 4) {
                            setFormHour("16:00 a 18:00");
                        }
                    }
                }
            }
        }
        setTurnoShift(turno);
        setFormRoom(room);
        setImporte(room === "Rooftop" ? 217800 : 60500);
    }

    const HandleFormDelete = (turno, room, description, unitF) => {
        setFormCancel(!formCancel);
        if (room === "Rooftop") {
            if (turno === 1) {
                setFormHour("09:00 a 12:00");
            } else {
                if (turno === 2) {
                    setFormHour("14:00 a 17:00");
                } else {
                    if (turno === 3) {
                        setFormHour("19:00 a 22:00");
                    }
                }
            }
        } else {
            if (turno === 1) {
                setFormHour("08:30 a 10:30");
            } else {
                if (turno === 2) {
                    setFormHour("11:00 a 13:00");
                } else {
                    if (turno === 3) {
                        setFormHour("13:30 a 15:30");
                    }
                    else {
                        if (turno === 4) {
                            setFormHour("16:00 a 18:00");
                        }
                    }
                }
            }
        }
        setTurnoShift(turno);
        setFormRoom(room);
        setDesc(description);
        setUF(unitF)
    }

    const handleFormModify = () => {
        setImporte(formRoom === "Rooftop" ? 217800 : 60500);
        setFormModificar(!formModificar);
        setFormCancel(false);
    }

    const handleConfirmForm = () => {
        setFormConfirmarReserva(!formConfirmarReserva);
        setFormReserva(false);
    }

    const submitReserva = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        if (await verificarReservasMismaUF(date, unidadFuncional)) {
            setLoading(false);
            handleConfirmForm();
            return;
        }
        await guardarReserva(description, turnoShift, date, formRoom, unidadFuncional, importe);
        await handleSendEmail(description, date, turnoShift, formHour, formRoom, unidadFuncional, importe, email);
        setLoading(false);
        setMessage("Reserva creada con exito");
        setTimeout(() => {
            window.location.reload(); // Recarga la página
        }, 500); // 500ms = 0.5 segundos
    }

    const cancelReservation = async () => {
        setLoading(true);
        setMessage("");
        await deleteReservation(date, turnoShift, formRoom);
        await handleDeleteEmail(date, formHour, turnoShift, formRoom, desc, uf, email);
        setLoading(false);
        setMessage("Reserva eliminada con exito");
        setTimeout(() => {
            window.location.reload(); // Recarga la página
        }, 500); // 500ms = 0.5 segundos
    }

    const modifyReserva = async () => {
        setLoading(true);
        setMessage("");
        await updateReservation(date, turnoShift, formRoom, description || desc, unidadFuncional || uf, importe);
        await handleModifyEmail(date, formHour, turnoShift, formRoom, description || desc, unidadFuncional || uf, importe, email);
        setLoading(false);
        setMessage("Reserva Modificada con exito");
        setTimeout(() => {
            window.location.reload(); // Recarga la página
        }, 500); // 500ms = 0.5 segundos
    }

    const confirmedSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        await guardarReserva(description, turnoShift, date, formRoom, unidadFuncional, importe);
        await handleSendEmail(description, date, turnoShift, formHour, formRoom, unidadFuncional, importe, email);
        setLoading(false);
        setMessage("Reserva creada con exito");
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
                console.log(reservas)

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

    const roomButtonClass = (shift, room) => {
        const reservedShifts = reservations.filter(res => res.room === room).map(res => res.shift);

        const isReserved = reservedShifts.some(reservedshift => reservedshift === shift);

        const [day, month, year] = date.split("-");
        const buttonDate = new Date(year, month - 1, day);
        const isExpired = buttonDate < formattedTime;

        if (isReserved) return "reserved";
        if (isExpired) return "expired";
        return "";
    };

    return (
        <>
            <div className={`${formReserva ? "formSection no-scroll " : "vanish"}`}>
                <div className="formBox">
                    <form className="formFather" onSubmit={(e) => submitReserva(e)}>
                        <div className="textForm textoFuerte">Desea reservar esta sala?</div>
                        <div className="textForm">Fecha: {date}</div>
                        <div className="textForm">Hora: {formHour}</div>
                        <div className="textForm">Sala: {formRoom}</div>
                        <div className="textForm">Importe (+ IVA): ${importe}</div>
                        <div className="textForm">Email: {email}</div>
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder="Descripcion Reunion"
                            required
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                        />
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder="Unidad Funcional"
                            required
                            onChange={(e) => setUnidadFuncional(e.target.value)}
                            value={unidadFuncional}
                        />
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => {
                                HandleFormReserva("", "");
                                setDescription("");
                                setUnidadFuncional("");
                            }}>Cancelar</button>
                            <button className="submitReserva">Aceptar</button>
                        </div>
                        {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i> Guardando Reserva...</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </form>
                </div>
            </div>
            <div className={`${formCancel ? "formSection no-scroll " : "vanish"}`}>
                <div className="formBox">
                    <div className="formFather">
                        <div className="textForm textoFuerte">Desea cancelar esta reserva?</div>
                        <div className="textForm">Fecha: {date}</div>
                        <div className="textForm">Turno: {turnoShift}</div>
                        <div className="textForm">Hora: {formHour}</div>
                        <div className="textForm">Sala: {formRoom}</div>
                        <div className="textForm">Description: {desc}</div>
                        <div className="textForm">Unidad Funcional: {uf}</div>
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => HandleFormDelete("", "")}>Cancelar</button>
                            <button className="submitReserva" onClick={() => handleFormModify()}>Modificar</button>
                            <button className="submitReserva" onClick={() => cancelReservation()}>Aceptar</button>
                        </div>
                        {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i> Eliminando Reserva...</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </div>
                </div>
            </div>
            <div className={`${formModificar ? "formSection no-scroll" : "vanish"}`}>
                <div className="formBox">
                    <div className="formFather">
                        <div className="textForm textoFuerte">Desea modificar esta sala?</div>
                        <div className="textForm">Fecha: {date}</div>
                        <div className="textForm">Turno: {turnoShift}</div>
                        <div className="textForm">Hora: {formHour}</div>
                        <div className="textForm">Sala: {formRoom}</div>
                        <div className="textForm">Email: {email}</div>
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder={`Descripcion Actual: ${desc}`}
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                        />
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder={`UF Actual: ${uf}`}
                            onChange={(e) => setUnidadFuncional(e.target.value)}
                            value={unidadFuncional}
                        />
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => {
                                handleFormModify();
                                setDescription("");
                                setUnidadFuncional("");
                            }}>Cancelar</button>
                            <button className="submitReserva" onClick={() => modifyReserva()}>Modificar</button>
                        </div>
                        {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i>Actualizando Reserva...</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </div>
                </div>
            </div>
            <div className={`${formConfirmarReserva ? "formSection no-scroll " : "vanish"}`}>
                <div className="formBox">
                    <form className="formFather" onSubmit={(e) => confirmedSubmit(e)}>
                        <div className="textForm textoFuerte">Esta seguro/a que desea reservar esta Sala?</div>
                        <div className="textForm">La Unidad Funcional ingresada ya tiene una reserva esta semana</div>
                        <div className="textForm">Fecha: {date}</div>
                        <div className="textForm">Hora: {formHour}</div>
                        <div className="textForm">Sala: {formRoom}</div>
                        <div className="textForm">Importe (+ IVA): ${importe}</div>
                        <div className="textForm">Email: {email}</div>
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder="Descripcion Reunion"
                            required
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                        />
                        <input
                            type="text"
                            className="inputTitle"
                            placeholder="Unidad Funcional"
                            required
                            onChange={(e) => setUnidadFuncional(e.target.value)}
                            value={unidadFuncional}
                        />
                        <div className="submitButton">
                            <button className="submitReserva" onClick={() => {
                                HandleFormReserva("", "");
                                setDescription("");
                                setUnidadFuncional("");
                            }}>Cancelar</button>
                            <button className="submitReserva">Aceptar</button>
                        </div>
                        {loading && <p style={{ color: "black" }}><i className='bx bx-loader-alt bx-spin' ></i> Guardando Reserva...</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </form>
                </div>
            </div>
            <div className="reservation-page">
                <h1 className="reservationsTitle">Reservas para el {date}</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div className="hours-container">
                    <h2 className='containerText'>Salas</h2>
                    {Array.from({ length: 4 }).map((_, actualIndex) => {
                        const startingIndex = 1; // Índice inicial
                        const index = startingIndex + actualIndex;
                        const shift = index;
                        const room1ButtonClass = roomButtonClass(index, "1");
                        const room2ButtonClass = roomButtonClass(index, "2");
                        let horaida = ''
                        if (shift === 1) {
                            horaida = "08:30 a 10:30";
                        }
                        if (shift === 2) {
                            horaida = "11:00 a 13:00";
                        }
                        if (shift === 3) {
                            horaida = "13:30 a 15:30";
                        }
                        if (shift === 4) {
                            horaida = "16:00 a 18:00";
                        }

                        return (
                            <div key={shift} className="hour-row">
                                <div className="hour">Turno {shift} - {horaida}</div>
                                <div className="buttons">
                                    <button
                                        className={`room-button ${room1ButtonClass}`}
                                        disabled={room1ButtonClass == "expired"}
                                        onClick={() => {
                                            if (room1ButtonClass === "reserved") {
                                                const reservation = reservations.find(res => res.shift === shift && res.room === "1");
                                                HandleFormDelete(shift, "1", reservation.description, reservation.uf);
                                            } else {
                                                HandleFormReserva(shift, "1");
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
                                                const reservation = reservations.find(res => res.shift === shift && res.room === "2");
                                                HandleFormDelete(shift, "2", reservation.description, reservation.uf);
                                            } else {
                                                HandleFormReserva(shift, "2");
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
                <div className="hours-container">
                    <h2 className='containerText'>RoofTop</h2>
                    {Array.from({ length: 3 }).map((_, actualIndex) => {
                        const startingIndex = 1; // Índice inicial
                        const index = startingIndex + actualIndex;
                        const shift = index;

                        const [day, month, year] = date.split("-");
                        // Busca si hay una reserva para Rooftop en la fecha actual
                        const room3Reserved = reservations.find(
                            res => res.room === "Rooftop" && res.shift === shift
                        );

                        const room3ButtonClass = () => {
                            const buttonDate = new Date(year, month - 1, day, 15, 0);
                            return buttonDate < formattedTime ? 'expired' : '';
                        };

                        let horaida = ''
                        if (shift === 1) {
                            horaida = "09:00 a 12:00";
                        }
                        if (shift === 2) {
                            horaida = "14:00 a 17:00";
                        }
                        if (shift === 3) {
                            horaida = "19:00 a 22:00";
                        }

                        return (
                            <div key={shift} className="hour-row">
                                <div className="hour">Turno {shift} - {horaida}</div>
                                <div className="buttons">
                                    <button
                                        className={`room-button ${room3ButtonClass() ? 'expired' : room3Reserved ? 'reserved' : ''}`}
                                        disabled={room3ButtonClass()}
                                        onClick={() => {
                                            if (room3Reserved) {
                                                const des = room3Reserved.description;
                                                const unitF = room3Reserved.uf;
                                                HandleFormDelete(shift, "Rooftop", des, unitF);
                                            } else {
                                                HandleFormReserva(shift, "Rooftop");
                                            }
                                        }}
                                    >
                                        Rooftop
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