import { firestore } from "./config";
import { collection, query, where, getDocs, Timestamp, deleteDoc } from "firebase/firestore";

export const deleteReservation = async (date, time, room) => {
    const [day, month, year] = date.split("-");
    const [hours, minutes] = time.split(":").map(Number);
    const dateObject = new Date(year, month - 1, day, hours - 3, minutes);
    const timestamp = Timestamp.fromDate(dateObject);
    try {
        // Crea la consulta para buscar el documento por los campos que conoces
        const q = query(
            collection(firestore, "reservas"),
            where("date", "==", timestamp),
            where("room", "==", room) // Puedes agregar más filtros si es necesario
        );

        // Obtiene los documentos que coinciden con la consulta
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No se encontraron documentos que coincidan con los filtros.");
            return;
        }

        // Eliminar los documentos encontrados
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
            console.log(`Documento con ID ${doc.id} eliminado`);
        });
    } catch (error) {
        console.error("Error al eliminar el documento: ", error);
    }
}