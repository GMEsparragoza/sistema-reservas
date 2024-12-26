'use client'

import React, { useState, useEffect } from 'react'
import './calendar.css'
import { getDaysWithReservations } from '@/firebase/getCalendar';
import Link from 'next/link';

export default function Calendar() {

  const today = new Date();

  const [monthShowed, setMonthShowed] = useState(today.getMonth() + 1);
  const [yearShowed, setYearShowed] = useState(today.getFullYear());

  const getHrefByDayAndMonth = (day, month) => {

    let dayString = day <= 9 ? `0${day}` : `${day}`;
    let monthString = month <= 9 ? `0${month}` : `${month}`;

    return `/reservations/${dayString}-${monthString}-${yearShowed}`;
  }

  const [reservationDays, setReservationDays] = useState(getDaysWithReservations(monthShowed, yearShowed));

  const HandleMonthChange = (plus) => {
    if (plus) {
      if (monthShowed >= 12) {
        setYearShowed(yearShowed + 1);
        setMonthShowed(1);
        return
      }
      setMonthShowed(monthShowed + 1);
    }
    else {
      if (monthShowed <= 1) {
        setYearShowed(yearShowed - 1);
        setMonthShowed(12);
        return
      }
      setMonthShowed(monthShowed - 1);
    }
  }

  useEffect(() => {
    const UpdateReservations = async () => {
      setReservationDays(await getDaysWithReservations(monthShowed, yearShowed));
    }
    UpdateReservations();
  }, [monthShowed]);

  const totalDays = (new Date(yearShowed, monthShowed, 0)).getDate() - 1;
  const dayOne = (new Date(yearShowed, monthShowed - 1, 1)).getDay();



  let days = []

  for (let i = 0; i <= 41; i++) {
    if (i < dayOne || i > totalDays + dayOne) {
      days.push(<div className="day"></div>)
    }
    else {
      if (reservationDays[i - dayOne] > 0) {
        days.push(<Link href={getHrefByDayAndMonth(i - dayOne + 1, monthShowed)} className="day able" key={i}>{i - dayOne + 1} <i className={`bx bxs-circle ${(reservationDays[i - dayOne] === 1) ? "black" : "red"}`}></i></Link>)
      }
      else {
        days.push(<Link href={getHrefByDayAndMonth(i - dayOne + 1, monthShowed)} className="day able" key={i}>{i - dayOne + 1}</Link>)
      }
    }
  }

  return (
    <>
      <div className="calendarMain">
        <h1 className="calendarTitle">Calendario - {yearShowed} - {(new Date(yearShowed, monthShowed - 1, 1)).toLocaleDateString("es-ES", { month: "long" }).charAt(0).toUpperCase() + (new Date(yearShowed, monthShowed - 1, 1)).toLocaleDateString("es-ES", { month: "long" }).slice(1)}</h1>
        <div className="calendarContainer">
          <i className="bx bx-chevron-left arrow" onClick={() => HandleMonthChange(false)}></i>
          <ul className='calendar' key="calendar">
            <li key="D" className="day dayname">D</li>
            <li key="L" className="day dayname">L</li>
            <li key="M" className="day dayname">M</li>
            <li key="X" className="day dayname">X</li>
            <li key="J" className="day dayname">J</li>
            <li key="V" className="day dayname">V</li>
            <li key="S" className="day dayname">S</li>
            {days}
          </ul>
          <i className="bx bx-chevron-right arrow" onClick={() => HandleMonthChange(true)}></i>
        </div>
      </div>
    </>
  )
}