export const handleDownload = async () => {
    try {
        // Hacer una solicitud GET a la API para generar el archivo
        const response = await fetch('/api/generarExcel');

        if (!response.ok) {
            throw new Error('Error al generar el archivo');
        }

        // Convertir la respuesta a un Blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Reservas.xlsx'; // Nombre del archivo
        link.click();
        window.URL.revokeObjectURL(url); // Liberar el objeto URL
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
    }
};