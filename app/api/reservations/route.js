// /app/api/reservations/route.js
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Obtiene la ruta absoluta del archivo
        const filePath = path.join(process.cwd(), 'data', 'reservations.json');
        
        // Lee el archivo
        const data = fs.readFileSync(filePath, 'utf-8');
        
        // Convierte el contenido a JSON
        const reservations = JSON.parse(data);

        // Retorna los datos como JSON
        return new Response(JSON.stringify(reservations), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Error al leer las reservas' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}
