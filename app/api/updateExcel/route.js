import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs/promises';

const TEMP_FILE_PATH = '/tmp/reservas.xlsx';

export async function POST(req) {
    try {
        const { data } = await req.json(); // Datos enviados desde el cliente

        // Verificar si el archivo Excel existe
        const fileExists = await fs
            .access(TEMP_FILE_PATH)
            .then(() => true)
            .catch(() => false);

        const workbook = new ExcelJS.Workbook();

        if (fileExists) {
            // Leer el archivo Excel existente
            await workbook.xlsx.readFile(TEMP_FILE_PATH);
        } else {
            // Crear un nuevo archivo si no existe
            const worksheet = workbook.addWorksheet('Reservas');
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 20 },
                { header: 'Hour', key: 'hour', width: 10 },
                { header: 'Room', key: 'room', width: 20 },
                { header: 'Description', key: 'desc', width: 40 },
                { header: 'Unidad Funcional', key: 'uf', width: 40 },
                { header: 'Importe', key: 'importe', width: 20 },
            ];
        }

        const worksheet = workbook.getWorksheet('Reservas');

        // Agregar nuevas filas
        data.forEach((row) => worksheet.addRow(row));

        // Guardar los cambios en el archivo Excel
        await workbook.xlsx.writeFile(TEMP_FILE_PATH);

        return new Response(
            JSON.stringify({ message: 'Datos actualizados exitosamente.' }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: 'Error al actualizar el archivo Excel.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}


export async function DELETE(req) {
    try {
        const { date, hour, room } = await req.json(); // Identificadores de la reserva a eliminar

        // Verificar si el archivo Excel existe
        const fileExists = await fs
            .access(TEMP_FILE_PATH)
            .then(() => true)
            .catch(() => false);

        if (!fileExists) {
            return new Response(
                JSON.stringify({ error: 'El archivo de reservas no existe.' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const workbook = new ExcelJS.Workbook();

        // Leer el archivo Excel existente
        await workbook.xlsx.readFile(TEMP_FILE_PATH);
        const worksheet = workbook.getWorksheet('Reservas');

        if (!worksheet) {
            return new Response(
                JSON.stringify({ error: 'La hoja "Reservas" no existe en el archivo.' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Buscar y eliminar la fila correspondiente
        let rowDeleted = false;

        worksheet.eachRow((row, rowNumber) => {
            const [rowDate, rowHour, rowRoom] = [
                row.getCell(1).value, // Primera columna
                row.getCell(2).value, // Segunda columna
                row.getCell(3).value, // Tercera columna
            ];

            if (rowDate === date && rowHour === hour && rowRoom === room) {
                worksheet.spliceRows(rowNumber, 1); // Eliminar la fila
                rowDeleted = true;
            }
        });

        if (!rowDeleted) {
            return new Response(
                JSON.stringify({ error: 'No se encontró ninguna reserva con los datos especificados.' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Guardar los cambios en el archivo Excel
        await workbook.xlsx.writeFile(TEMP_FILE_PATH);

        return new Response(
            JSON.stringify({ message: 'Reserva eliminada exitosamente.' }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: 'Error al eliminar la reserva.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function GET() {
    try {
        const fileExists = await fs
            .access(TEMP_FILE_PATH)
            .then(() => true)
            .catch(() => false);

        if (!fileExists) {
            return new Response('Archivo no encontrado.', { status: 404 });
        }

        const fileBuffer = await fs.readFile(TEMP_FILE_PATH);

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="reservas.xlsx"',
            },
        });
    } catch (error) {
        console.error(error);
        return new Response('Error al descargar el archivo.', { status: 500 });
    }
}