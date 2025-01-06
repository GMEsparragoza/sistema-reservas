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

            reservations.push({
                room: data.room,
                desc: data.description,
                uf: data.uf,
                importe: data.importe,
                date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
                hour: `${timestamp.getUTCHours().toString().padStart(2, '0')}:${(timestamp.getMinutes() == 0) ? "00" : "30"}`
            });
        });
    } catch (error) {
        console.error("Error al obtener las reservaciones:", error);
    }

    return reservations;
}