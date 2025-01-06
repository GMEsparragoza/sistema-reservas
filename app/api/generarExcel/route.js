import ExcelJS from 'exceljs';
import { getReservations } from '@/firebase/getReservas';

export async function GET() {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reservas');

        worksheet.columns = [
            { header: 'Fecha', key: 'date', width: 20 },
            { header: 'Hora', key: 'hour', width: 10 },
            { header: 'Sala', key: 'room', width: 20 },
            { header: 'Descripción', key: 'desc', width: 40 },
            { header: 'Unidad Funcional', key: 'uf', width: 40 },
            { header: 'Importe', key: 'importe', width: 20 },
        ];

        const reservas = await getReservations();

        const reservasPorMes = reservas.reduce((acc, reserva) => {
            // Extraer mes y año de la fecha en formato día-mes-año
            const [day, month, year] = reserva.date.split('-');
            const mesAnio = `${new Date(year, month - 1).toLocaleString('es-ES', { month: 'long' })} ${year}`;
            if (!acc[mesAnio]) {
                acc[mesAnio] = [];
            }
            acc[mesAnio].push(reserva);
            return acc;
        }, {});

        for (const [mesAnio, reservasMes] of Object.entries(reservasPorMes)) {
            worksheet.addRow([`Mes: ${mesAnio}`]);
            worksheet.addRow([]);

            reservasMes.forEach((reserva) => worksheet.addRow(reserva));

            const totals = reservasMes.reduce((acc, reserva) => {
                if (!acc[reserva.room]) {
                    acc[reserva.room] = 0;
                }
                acc[reserva.room] += reserva.importe;
                return acc;
            }, {});

            worksheet.addRow([]);

            Object.entries(totals).forEach(([room, total]) => {
                worksheet.addRow({
                    uf: `Total para Sala ${room} en ${mesAnio}:`,
                    importe: total
                });
            });

            worksheet.addRow([]);
            worksheet.addRow([]);
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="Reservas.xlsx"',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al generar el archivo Excel' }), { status: 500 });
    }
}