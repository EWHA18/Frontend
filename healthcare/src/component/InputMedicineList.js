import React from 'react';

const InputMedicineList = ({medicines}) => {
    return(
        <div>
            {medicines.map(m=>(
                <div key={m.id} className="medicine-">번호:{m.id} <br/>약품명:{m.name} <br/>섭취량:{m.intake}</div>
            ))}
        </div>
    )
}

export default InputMedicineList;