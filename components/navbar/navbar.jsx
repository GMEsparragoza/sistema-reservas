'use client'

import React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { PageUse } from '@/utils/Context'

import './navbar.css'

export default function Navbar(){

  const [emailOpen, setEmailOpen] = useState(false);

  const [newEmail, setNewEmail] = useState('');

  const { email, updateEmail } = PageUse();

  const HandleEmailButton = () =>{
    setEmailOpen(!emailOpen);
  }

  return (
    <>
      <div className={`${emailOpen ? "emailSection" : "vanish"}`}>
        <div className="emailBox">
          <i className="bx bx-x bx-md"  onClick={() => HandleEmailButton()}></i>
          <div className="email"><b>Email actual:</b> {email}</div>
          <input type="email" className="inputEmail" placeholder="Nuevo Email" onChange={(e) => setNewEmail(e.target.value)}/>
          <button className="changeEmail" onClick={() => updateEmail(newEmail)}>Actualizar Email</button>
        </div>
      </div>
      <nav className="navbar">
        <div className="logo"></div>
        <div className="nav">
          <Link className="link" href={"/"}>Inicio</Link>
          <Link className="link" href={"/calendar"}>Calendario</Link>
          <button className="emailButton" onClick={() => HandleEmailButton()}>Email</button>
        </div>
      </nav>
    </>
  )
}
