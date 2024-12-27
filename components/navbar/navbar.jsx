'use client'

import React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { PageUse } from '@/utils/Context'
import { downloadExcel } from './downloadExcel'

import './navbar.css'

export default function Navbar() {
  const [emailOpen, setEmailOpen] = useState(false);
  const [excelData, setExcelData] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [formVerifyCode, setFormVerifyCode] = useState("");
  const [toggleBut, setToggleBut] = useState(false);
  const [verificationCode, setVerificationCode] = useState(0);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const { email, updateEmail, verifyEmail, error } = PageUse();

  const validateEmail = async () => {
    setSuccess("");
    setVerificationCode(0);
    
    const code = await verifyEmail(newEmail);
    if (code) {
        setVerificationCode(code); // Actualizar el estado para referencia futura si es necesario
        setToggleBut(true);
        setSuccess("Mail de verificación enviado");
    }
  }

  const modEmail = async () => {
    setMessage("");
    setSuccess("");
    
    if (formVerifyCode != verificationCode){
      setMessage("El codigo de verificacion no es correcto");
      return;
    }

    await updateEmail(newEmail);
    setSuccess("Mail actualizado con exito");
    // Recargar la página después de 1 segundo
    setTimeout(() => {
      setToggleBut(false);
      window.location.reload(); // Recarga la página
    }, 100); // 100ms = 0.1 segundos
  }

  const HandleEmailButton = () => {
    setEmailOpen(!emailOpen);
  }

  const HandleExcelData = async () => {
    if(!excelData){
      await downloadExcel();
      setSuccess("Excel descargado con exito");
    }
    setExcelData(!excelData);
  }

  return (
    <>
      <div className={`${emailOpen ? "emailSection" : "vanish"}`}>
        <div className="emailBox">
          <i className="bx bx-x bx-md" onClick={() => HandleEmailButton()}></i>
          {message && <p style={{ color: "red" }}>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          <div className="email"><b>Email actual:</b> {email}</div>
          <input type="email" className="inputEmail" placeholder="Nuevo Email" onChange={(e) => setNewEmail(e.target.value)} />
          <button className={`${toggleBut ? "vanish" : "changeEmail"}`} onClick={() => validateEmail()}>Verificar Email</button>
          <input type="text" className={`${toggleBut ? "inputEmail" : "vanish"}`} placeholder="Codigo de Verificacion" onChange={(e) => setFormVerifyCode(e.target.value)} />
          <button className={`${toggleBut ? "changeEmail" : "vanish"}`} onClick={() => modEmail()}>Actualizar Email</button>
        </div>
      </div>
      <div className={`${excelData ? "emailSection" : "vanish"}`}>
        <div className="emailBox">
          {success && <p style={{ color: "green" }}>{success}</p>}
          <button className={`${toggleBut ? "vanish" : "changeEmail"}`} onClick={async () => await HandleExcelData()}>Aceptar</button>
        </div>
      </div>
      <nav className="navbar">
        <img src="/DomeBusinessPlaza.png" alt="Dome" className="logo" />
        <div className="nav">
          <Link className="link" href={"/"}>Inicio</Link>
          <Link className="link" href={"/reservations"}>Reservar</Link>
          <button className="emailButton" onClick={() => HandleEmailButton()}>Email</button>
          <button className="emailButton" onClick={async () => await HandleExcelData()}>Descargar Excel</button>
        </div>
      </nav>
    </>
  )
}
