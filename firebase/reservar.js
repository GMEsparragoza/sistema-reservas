import { addDoc, collection, Timestamp } from "firebase/firestore"
import { firestore } from "@/firebase/config";

export const guardarReserva = async (title, hour, date, room) => {
    // Paso 1: Dividir la fecha en día, mes y año (Formato inicial: DD-MM-YYYY)
    const [day, month, year] = date.split("-");

    // Paso 2: Dividir la hora en horas y minutos (Formato inicial: HH:mm)
    const [hours, minutes] = hour.split(":").map(Number);

    // Paso 3: Crear un objeto Date con la fecha y hora especificada
    const dateObject = new Date(year, month - 1, day, hours, minutes);

    // Paso 4: Verificar si la hora ajustada es menor o igual a "02:00" y restar un día si es necesario
    if (dateObject.getHours() <= 2) {
        dateObject.setDate(dateObject.getDate() - 1);
    }

    // Paso 5: Restar 3 horas a la hora actual
    dateObject.setHours(dateObject.getHours() - 3);

    // Paso 6: Formatear la fecha y hora ajustadas
    const updatedDate = dateObject.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD
    const updatedHour = dateObject.toTimeString().slice(0, 5);  // Hora en formato HH:mm

    // Paso 7: Combinar la fecha y hora ajustadas en un nuevo objeto Date
    const combinedDateTime = new Date(`${updatedDate}T${updatedHour}:00`);

    // Paso 8: Convertir el objeto Date ajustado a Timestamp
    const timestamp = Timestamp.fromDate(combinedDateTime);

    // Paso 9: Preparar el objeto formData con los datos necesarios
    const formData = {
        room,
        title,
        date: timestamp,
    };

    // Paso 10: Insertar los datos en Firestore
    try {
        const reservaCollectionRef = collection(firestore, "reservas");
        await addDoc(reservaCollectionRef, formData);
    } catch (error) {
        console.error("Error al agregar la reserva:", error);
    }
}
