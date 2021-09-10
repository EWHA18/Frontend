import React, { useState, useRef, useCallback } from 'react';
import './index.css';
// import Main from './Main.js';
import InputMedicine from './component/InputMedicine';
import InputMedicineList from './component/InputMedicineList';
import axios from 'axios';
import FileUpload from './component/FileUpload';

function App() {
  const [medicines,setMedicines] = useState([]); 
  const nextId = useRef(1);
  const [heavy,setHeavy] = useState([]);
  const [output,setOutput] = useState([]);
  const [test,setTest] = useState([]);
  const [checked,setCheck] = useState([]);
  const [show_state,setShow] = useState([]);
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
  await axios.post("http://localhost:5000/api/sendintake",medicines).then(
      async response=>{
        console.log(response.data.data.intake);
        setHeavy(response.data.data.intake.filter(intake_element => intake_element.isHeavyMetal==true));       
        setOutput(response.data.data.intake); 
        setTest(response.data.data.intake);
        setCheck(false);
        setShow("중금속만 보기");
      })
}
const heavy_button = () => {
  if(!checked){
    setTest(heavy);
    setCheck(true);
    setShow("전체 보기");
  }else{
    setTest(output);
    setCheck(false);
    setShow("중금속만 보기");
  }
}
  return (
    <div>
      <FileUpload/>
      <div className="header">
        <h1>건강기능식품 프로젝트</h1>
      </div>
      <div className="body">
        <div className="form">
          <InputMedicine onInsert={onInsert}/>
        </div>
        <button className="sendBtn" onClick={onClick}>총 성분 섭취량 구하기</button>
        <button className="heavyBtn" onClick={heavy_button}>{show_state}</button>
        <div className="input">
          <h3>Input</h3>
          <InputMedicineList medicines={medicines}/>
        </div>
        <div className="output">
          <h3>Output</h3>
          {test.map(intake_element => (
                <div key={intake_element.word_id} className="medicine-">
                    <li>{intake_element.word_name} {intake_element.volume}{intake_element.unit}</li>
                </div>
            ))}
        </div> 
      </div>
    </div>
  );
}

export default App;