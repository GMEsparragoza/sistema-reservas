// app/api/sendConfirmationEmail/route.js
import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '@/utils/config';

const email = EMAIL_USER  // Tu correo de usuario
const pass = EMAIL_PASS;

export async function POST(req) {
    const { to, subject, html } = await req.json(); // Se recibe el correo, el asunto y el HTML del cuerpo del correo

    // Crear el transportador de correo utilizando nodemailer
    const transporter = nodemailer.createTransport({
        port: 465,
        secure: true, // upgrade later with STARTTLS
        service: 'gmail',
        auth: {
            user: email,
            pass,
        },
    });

    try {
        // Enviar el correo
        await transporter.sendMail({
            from: email, // El correo desde el cual se enviará
            to, // El correo al que se enviará
            subject, // El asunto del correo
            html, // El cuerpo del correo en formato HTML
        });

        return new Response(JSON.stringify({ message: 'Correo enviado correctamente' }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return new Response(JSON.stringify({ message: 'Hubo un problema al enviar el correo' }), {
            status: 500,
        });
    }
}
