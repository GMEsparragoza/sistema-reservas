
import React from 'react'
import "./index.css"
import Link from 'next/link';
import { getReservations } from '@/firebase/getReservas';

const meetings = await getReservations();

export default function page() {

    return (
        <>
            <div className="welcomeImg">
                <div className="welcome"></div>
            </div>
            <div className="container">
                <h1 className="title">Próximas Reuniones</h1>
                {meetings.length > 0 ? (
                    <ul className="list">
                        {meetings.map((meeting, id) => (
                            <li key={id} className="card">
                                <h2 className="meetingTitle">{meeting.title}</h2>
                                <p className="meetingInfo">
                                    <b>Fecha:</b> {meeting.date}<br />
                                    <b>Hora:</b> {meeting.time} <br />
                                    <b>Sala:</b> {meeting.room}
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
