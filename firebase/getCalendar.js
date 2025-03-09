import { firestore } from "./config";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getDaysWithReservations = async (month, year) => {

    const now = new Date();
    now.setHours(now.getHours() - 3);
    const dayOne = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    lastDay.setHours(23,59,59,99);
    lastDay.setHours(lastDay.getHours() - 3);
    dayOne.setHours(dayOne.getHours() - 3)

    const reservationDays = Array(totalDays).fill(0);
    const dataReservationDays = Array(totalDays).fill().map(() => []);

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
        const hour = date.getUTCHours();
        const mins = date.getMinutes();

        dataReservationDays[day-1].push({
            hour: (mins==0 ? `${hour}:00` : `${hour}:${mins}`),
            room: data.room,
            uf: data.uf,
            shift: data.shift
        });

        if (data.date.toDate() < now && reservationDays[day - 1] != 2) {
            reservationDays[day - 1] = 1
        }
        else {
            reservationDays[day - 1] = 2;
        }
    });
    const calendar = [reservationDays, dataReservationDays];
    console.log(calendar);

    return calendar;
}