"use client"

import React, { useState } from 'react'
import './formreserva.css'

export default function Formreserva({props}) {
    const {formReserva, setFormReserva} = useState(false);
    const {title, setTitle} = useState("");

    const HandleEmailButton = () =>{
        setFormReserva(!formReserva);
    }

    return (
        <>
            <div className={`${formReserva ? "formSection" : "vanish"}`}>
                <div className="formBox">
                    <div className="textForm"><b>Desea reservar una reunion?</b></div>
                    <div className="textForm">Fecha: {props.date}</div>
                    <div className="textForm">Hora: {props.time}</div>
                    <input type="text" className="inputTitle" placeholder="Titulo Reunion" onChange={(e) => setTitle(e.target.value)} />
                    <button className="submitReserva" onClick={() => modEmail()}>Actualizar Email</button>
                </div>
            </div>
        </>
    )
}
