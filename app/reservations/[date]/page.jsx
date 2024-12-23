import React from 'react'
import ReservationByDate from './components/reservationByDate'

const page = async ({params}) => {
  const {date} = await params;
  
  return (
    <>
      <ReservationByDate date={date}/>
    </>
  )
}

export default page