import { firestore } from "./config";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export const getReservations = async () => {
    const reservations = [];

    const now = new Date();
    now.setHours(now.getHours() - 3); // Resta 3 horas para ajustarlo a UTC-3

    try {
        // Consulta las reservas con fecha >= ahora, ordenadas por fecha ascendente
        const reservationsQuery = query(
            collection(firestore, "reservas"),
            where("date", ">=", now),
            orderBy("date", "asc"), // Ordenar por fecha ascendente
            limit(5) // Limitar a un máximo de 5 resultados
        );

        const reservationsSnap = await getDocs(reservationsQuery);

        reservationsSnap.docs.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.date.toDate();

            reservations.push({
                id: doc.id,
                room: data.room,
                title: data.title,
                date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
                time: `${timestamp.getUTCHours().toString().padStart(2, '0')}:00`
            });
        });
    } catch (error) {
        console.error("Error al obtener las reservaciones:", error);
    }

    return reservations;
}