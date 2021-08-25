import React, { useState, useRef, useCallback } from 'react';
import './index.css';
// import Main from './Main.js';
import InputMedicine from './component/InputMedicine';
import InputMedicineList from './component/InputMedicineList';

function App() {
  const [medicines,setMedicines] = useState([]); 
  const nextId = useRef(1);
  const onInsert = useCallback(
    data => {
      const medicine = {
        id:nextId.current,
        name: data.get('name'),
        intake: data.get('intake')
  };
  setMedicines(medicines.concat(medicine));
  nextId.current += 1;
},[medicines]);

  return (
    <div>
      <div className="header">
        <h1>건강기능식품 프로젝트</h1>
      </div>
      <div className="body">
        <div className="form">
          <InputMedicine onInsert={onInsert}/>
        </div>
        <button>총 성분 섭취량 구하기</button>
        <div className="input">
          <InputMedicineList medicines={medicines} className="output"/>
        </div> 
      </div>
    </div>
  );
}

export default App;