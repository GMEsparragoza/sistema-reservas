import React from 'react'
import ReservationByDate from './reservationByDate'

const page = ({params}) => {
  const {date} = params;
  
  return (
    <>
      <ReservationByDate date={date}/>
    </>
  )
}

export default page