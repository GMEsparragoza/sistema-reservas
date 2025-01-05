const handleSendEmail = async (description, date, hour, room, uf, importe, email) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #0056b3;">¡Confirmación de Reserva de Sala!</h2>
            <p>Estimado/a,</p>
            <p>Le informamos que su reunión ha sido confirmada con los siguientes detalles:</p>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li><strong>Fecha:</strong> ${date}</li>
                <li><strong>Hora:</strong> ${hour}</li>
                <li><strong>Sala:</strong> ${room}</li>
                <li><strong>Descripcion:</strong> ${description}</li>
                <li><strong>Unidad Funcional:</strong> ${uf}</li>
                <li><strong>Importe:</strong> $${importe}</li>
            </ul>
            <p style="margin-top: 20px;">Atentamente,<br><strong>Equipo de Reservas</strong></p>
        </div>
    `;

    await fetch('/api/sendConfirmationEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: email,
            subject: 'Confirmación de Reserva de Reunión',
            html,
        }),
    });
};

const handleDeleteEmail = async (date, hour, room, desc, uf, email) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color:rgb(181, 18, 18);">Notificación de Cancelación de Reserva</h2>
            <p>Estimado/a,</p>
            <p>Le informamos que su reserva ha sido cancelada. A continuación, le proporcionamos los detalles de la reserva cancelada:</p>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li><strong>Fecha:</strong> ${date}</li>
                <li><strong>Hora:</strong> ${hour}</li>
                <li><strong>Sala:</strong> ${room}</li>
                <li><strong>Descripcion:</strong> ${desc}</li>
                <li><strong>Unidad Funcional:</strong> ${uf}</li>
            </ul>
            <p style="margin-top: 20px;">Atentamente,<br><strong>Equipo de Reservas</strong></p>
        </div>
    `;

    await fetch('/api/sendConfirmationEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: email,
            subject: 'Notificación de Cancelación de Reserva',
            html,
        }),
    });
};

const handleModifyEmail = async (date, hour, room, desc, uf, importe, email) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color:rgb(0, 123, 255);">Actualización de Reserva Confirmada</h2>
            <p>Estimado/a,</p>
            <p>Le informamos que su reserva ha sido actualizada con éxito. A continuación, le proporcionamos los detalles de la reserva actualizada:</p>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li><strong>Fecha:</strong> ${date}</li>
                <li><strong>Hora:</strong> ${hour}</li>
                <li><strong>Sala:</strong> ${room}</li>
                <li><strong>Descripción:</strong> ${desc}</li>
                <li><strong>Unidad Funcional:</strong> ${uf}</li>
                <li><strong>Importe:</strong> ${importe}</li>
            </ul>
            <p style="margin-top: 20px;">Atentamente,<br><strong>Equipo de Reservas</strong></p>
        </div>
    `;

    await fetch('/api/sendConfirmationEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: email,
            subject: 'Notificación de Actualizacion de Reserva',
            html,
        }),
    });
};

export { handleSendEmail, handleDeleteEmail, handleModifyEmail }