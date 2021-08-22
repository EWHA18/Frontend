import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
const data=[];
const Main = () => {
    const [id,setId] = useState(0);
    const [name,setName] = useState('');
    const [num,setNum] = useState(0);
    const [intake,setIntake] = useState([]);

    const onChangeName = (e) => {
        setName(e.target.value);
    }
    const onChangeId = (e) => {
        setId(e.target.value);
    }
    const onChangeNum = (e) => {
        setNum(e.target.value);
    }    
    const onClick = async() => {
        data.push({"medicine_id": Number(id),"medicine_name": name, "num":Number(num)});
        console.log(typeof(data));
        await axios.post("http://localhost:5000/api/sendintake",data).then(
            async response=>{
                setIntake(response.data.data.intake);        
            })
    }
    return(
        <div>
            <div className="header">
                <h1>건강기능식품 프로젝트</h1>
            </div>
            <div className="body">
            <div className="input">
            <input value={name} placeholder="약품 이름을 입력하세요." onChange={onChangeName}></input>
            <input type="number" value={id} placeholder="약품 ID를 입력하세요." onChange={onChangeId}></input>
            <input type="number" value={num} placeholder="섭취량을 입력하세요." onChange={onChangeNum}></input>
            <button onClick={onClick}>성분 검색</button><br/>
            </div>
            <div className="output">
            {intake.map(intake_element => (
                <div key={intake_element.word_id}>
                    <li>{intake_element.word_id}번 {intake_element.volume}{intake_element.unit}</li>
                </div>
            ))}
            </div>
            </div>
        </div>
    );
}

export default Main;