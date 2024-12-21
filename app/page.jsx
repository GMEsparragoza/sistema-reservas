"use client"

import React from 'react'
import "./index.css"
import Link from 'next/link';
import { PageUse } from "@/utils/Context"

export default function page() {
    const { loading, error, meetings } = PageUse();



    if (loading) {
        return <p>Cargando reuniones...</p>;
    }

    return (
        <>
            <div className="container">
                <h1 className="title">Próximas Reuniones</h1>
                {meetings.length > 0 ? (
                    <ul className="list">
                        {meetings.map((meeting, id) => (
                            <li key={id} className="card">
                                <h2 className="meetingTitle">{meeting.title}</h2>
                                <p className="meetingInfo">
                                    Fecha: {meeting.date} <br />
                                    Hora: {meeting.time} <br />
                                    Sala: {meeting.room}
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
                {error && <p style={{color:"red"}}>{error}</p>}
            </div>
        </>
    )
}
