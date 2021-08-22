import React, { useState, useRef, useCallback } from 'react';
// import './index.css';
// import Main from './Main.js';
import InputMedicine from './component/InputMedicine';
import InputMedicineList from './component/InputMedicineList';

function App() {
  const [medicines,setMedicines] = useState([{
    id:1,
    name:"텐텐",
    intake: 1
}]); 
  const nextId = useRef(2);
  const onInsert = useCallback(
    data =>{
      const medicine = {
        id:nextId.current,
        name: data,
        intake: data
  };
  setMedicines(medicines.concat(medicine));
  nextId.current += 1;
},[medicines]);

  return (
    <div>
        <InputMedicine onInsert={onInsert}/>
        <InputMedicineList medicines={medicines}/>
    </div>
  );
}

export default App;