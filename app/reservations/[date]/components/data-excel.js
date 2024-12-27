const sendData = async (desc, date, hour, room, uf, importe) => {
    const data = [[date, hour, room, desc, uf, importe]];

    await fetch('/api/updateExcel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
    });

};


const deleteData = async (date, hour, room) => {
    await fetch('/api/updateExcel', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, hour, room }),
    });
}

export {sendData, deleteData}