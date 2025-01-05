import ExcelJS from 'exceljs';
import { getReservations } from '@/firebase/getReservas';

export async function GET() {
    try {
        // Crear un nuevo libro de trabajo de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reservas');

        // Definir las columnas
        worksheet.columns = [
            { header: 'Fecha', key: 'date', width: 20 },
            { header: 'Hora', key: 'hour', width: 10 },
            { header: 'Sala', key: 'room', width: 20 },
            { header: 'Descripción', key: 'desc', width: 40 },
            { header: 'Unidad Funcional', key: 'uf', width: 40 },
            { header: 'Importe', key: 'importe', width: 20 },
        ];

        const reservas = await getReservations();

        reservas.forEach((reserva) => worksheet.addRow(reserva));

        // Calcular el importe total por cada sala
        const totals = reservas.reduce((acc, reserva) => {
            if (!acc[reserva.room]) {
                acc[reserva.room] = 0;
            }
            acc[reserva.room] += reserva.importe;
            return acc;
        }, {});

        // Agregar filas vacías como separadores
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Agregar los totales por cada sala
        Object.entries(totals).forEach(([room, total]) => {
            worksheet.addRow({
                uf: `Total para Sala ${room}`,
                importe: total
            });
        });

        // Generar el archivo Excel en memoria
        const buffer = await workbook.xlsx.writeBuffer();

        // Establecer las cabeceras para forzar la descarga del archivo
        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="reservas.xlsx"',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al generar el archivo Excel' }), { status: 500 });
    }
}