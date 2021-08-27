import React, { useState, useRef, useCallback } from 'react';
import './index.css';
// import Main from './Main.js';
import InputMedicine from './component/InputMedicine';
import InputMedicineList from './component/InputMedicineList';
import axios from 'axios';

function App() {
  const [medicines,setMedicines] = useState([]); 
  const nextId = useRef(1);
  const [output,setOutput] = useState([]);

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

const onClick = async() => {
  console.log(medicines);
  await axios.post("http://localhost:5000/api/sendintake",medicines).then(
      async response=>{
        setOutput(response.data.data.intake);       
      })
}
  return (
    <div>
      <div className="header">
        <h1>건강기능식품 프로젝트</h1>
      </div>
      <div className="body">
        <div className="form">
          <InputMedicine onInsert={onInsert}/>
        </div>
        <button className="sendBtn" onClick={onClick}>총 성분 섭취량 구하기</button>
        
        <div className="input">
          <h3>Input</h3>
          <InputMedicineList medicines={medicines}/>
        </div>
        
        <div className="output">
          <h3>Output</h3>
        {output.map(intake_element => (
                <div key={intake_element.word_id} className="medicine-">
                    <li>{intake_element.word_id}번 {intake_element.volume}{intake_element.unit}</li>
                </div>
            ))}
        </div> 
      </div>
    </div>
  );
}

export default App;