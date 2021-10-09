import React from 'react';

const InputMedicineList = ({medicines}) => {
    return(
        <div>
            {medicines.map(m=>(
                <div key={m.id} className="medicine-"> {m.weight}kg |  {m.name}, {m.intake}정</div>
            ))}
        </div>
    )
}

export default InputMedicineList;