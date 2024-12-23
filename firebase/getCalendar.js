import { firestore } from "./config";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getDaysWithReservations = async (month, year) =>{

    const dayOne = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();

    const reservationDays = Array.from(totalDays).fill(false);

    const reservationsQuery = query(
        collection(firestore, "reservas"),
        where("date", ">=", dayOne),
        where("date", "<=", lastDay)
    );
    const reservationsSnap = await getDocs(reservationsQuery);

    reservationsSnap.docs.forEach((doc) => {
        const data = doc.data();
        const date = data.date.toDate();
        const day = date.getUTCDate();
    
        // Marcar el día como `true` si hay una reunión
        reservationDays[day - 1] = true; // Restamos 1 para ajustar al índice del array
    });
    return reservationDays;
}