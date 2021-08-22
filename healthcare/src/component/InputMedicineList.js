import React from 'react';

const InputMedicineList = ({medicines}) => {
    return(
        <div>
            {medicines.map(m=>(
                <div key={m.id}>ID:{m.id} <br/>NAME:{m.name} <br/>INTAKE:{m.intake}</div>
            ))}
        </div>
    )
}

export default InputMedicineList;