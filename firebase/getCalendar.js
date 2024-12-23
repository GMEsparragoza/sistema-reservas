import { firestore } from "./config";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getDaysWithReservations = async (month, year) => {

    const now = new Date();
    now.setHours(now.getHours() - 3);
    const dayOne = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();

    const reservationDays = Array.from(totalDays).fill(0);

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

        console.log(data.date.toDate());
        console.log(now);


        if (data.date.toDate() < now && reservationDays[day - 1] != 2) {
            reservationDays[day - 1] = 1
        }
        else {
            reservationDays[day - 1] = 2;
        }
    });
    return reservationDays;
}