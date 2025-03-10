import { addDoc, collection, Timestamp, query, getDocs, where } from "firebase/firestore"
import { firestore } from "@/firebase/config";

function areDatesInSameWeek(date1, date2) {
    const getWeekNumber = (date) => {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    };

    return getWeekNumber(date1) === getWeekNumber(date2) && date1.getFullYear() === date2.getFullYear();
}

export const verificarReservasMismaUF = async (date, uf) => {
    const [day, month, year] = date.split("-");
    const dateObject = new Date(year, month - 1, day);
    dateObject.setHours(dateObject.getHours() - 3);

    const range1 = new Date(year, month - 1, dateObject.getDate() - 8);
    const range2 = new Date(year, month - 1, dateObject.getDate() + 8);

    console.log(range1, range2, dateObject);
    const reservationsSameUFQuery = query(
        collection(firestore, "reservas"),
        where("date", ">=", range1),
        where("date", "<=", range2),
        where("uf", "==", uf)
    );
    const reservationsSnap = await getDocs(reservationsSameUFQuery);
    let isSameUF = false;
    reservationsSnap.forEach(reservation => {
        console.log(reservation.data());

        if (areDatesInSameWeek(dateObject, reservation.data().date.toDate())) {
            isSameUF = true;
        }
    });
    return isSameUF;
}

export const guardarReserva = async (description, turno, date, room, uf, importe) => {
    // Paso 1: Dividir la fecha en día, mes y año (Formato inicial: DD-MM-YYYY)
    const [day, month, year] = date.split("-");

    // Paso 3: Crear un objeto Date con la fecha y hora especificada
    const dateObject = new Date(year, month - 1, day);

    // Paso 5: Restar 3 horas a la hora actual
    dateObject.setHours(dateObject.getHours() - 3);

    // Paso 6: Formatear la fecha y hora ajustadas
    const updatedDate = dateObject.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD

    // Paso 7: Combinar la fecha y hora ajustadas en un nuevo objeto Date
    const combinedDateTime = new Date(`${updatedDate}T15:00`);

    // Paso 8: Convertir el objeto Date ajustado a Timestamp
    const timestamp = Timestamp.fromDate(combinedDateTime);

    // Paso 9: Preparar el objeto formData con los datos necesarios
    const formData = {
        description,
        date: timestamp,
        shift: turno,
        room,
        uf: uf,
        importe
    };

    // Paso 10: Insertar los datos en Firestore
    try {
        const reservaCollectionRef = collection(firestore, "reservas");
        await addDoc(reservaCollectionRef, formData);
    } catch (error) {
        console.error("Error al agregar la reserva:", error);
    }
}
