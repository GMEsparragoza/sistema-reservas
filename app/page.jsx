
import React from 'react'
import "./index.css"
import { Reservations } from '@/components/reservations/reservations'



export default function page() {

    return (
        <>
            <div className="welcomeImg">
                <div className="welcome"></div>
            </div>
            <div className="parentContainer">
                <div className="containerMain">
                    <Reservations />
                </div>
            </div>
        </>
    )
}
