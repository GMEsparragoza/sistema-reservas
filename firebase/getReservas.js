import { firestore } from "./config";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export const getReservations = async () => {
    const reservations = [];


    try {
        // Consulta las reservas con fecha >= ahora, ordenadas por fecha ascendente
        const reservationsQuery = query(
            collection(firestore, "reservas"),
            orderBy("date", "asc") // Ordenar por fecha descendente
        );

        const reservationsSnap = await getDocs(reservationsQuery);

        reservationsSnap.docs.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.date.toDate();

            const hourRange = data.shift === 1 ? '08:30 a 10:30' : data.shift === 2 ? '11:00 a 13:00' : data.shift === 3 ? '13:30 a 15:30' : '16:00 a 18:00'
            reservations.push({
                room: data.room,
                desc: data.description,
                uf: data.uf,
                shift: data.shift.toString(),
                importe: data.importe,
                date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
                hour: hourRange
            });
        });
    } catch (error) {
        console.error("Error al obtener las reservaciones:", error);
    }

    return reservations;
}