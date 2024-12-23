import { firestore } from "./config";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getReservations = async () => {

    const now = new Date();
    now.setHours(now.getHours() - 3); // Resta 3 horas para ajustarlo a UTC-3

    const reservationsQuery = query(
        collection(firestore, "reservas"),
        where("date", ">=", now)
    );
    const reservationsSnap = await getDocs(reservationsQuery);

    const reservations = [];
    reservationsSnap.docs.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.date.toDate();

        reservations.push({
            id: doc.id,
            room: doc.data().room,
            title: doc.data().title,
            date: `${timestamp.getUTCDate().toString().padStart(2, '0')}-${(timestamp.getUTCMonth() + 1).toString().padStart(2, '0')}-${timestamp.getUTCFullYear()}`,
            time: `${timestamp.getUTCHours().toString().padStart(2, '0')}:00`
        });

    });
    return reservations;
}