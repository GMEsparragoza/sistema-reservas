export async function downloadExcel() {
    try {
        const response = await fetch('/api/updateExcel', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Error al descargar el archivo');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reservas.xlsx'; // Nombre del archivo
        link.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error.message);
        alert('No se pudo descargar el archivo.');
    }
}