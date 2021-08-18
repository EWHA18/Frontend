import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
const Main = () => {
    const [id,setId] = useState(0);
    const [name,setName] = useState('');
    const [num,setNum] = useState(0);
    const [intake,setIntake] = useState([]);
    const [list,setList] = useState([]);
    
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
        const data = {"medicine_id": id,"medicine_name": name, "num":num};
        setList(list => [...list,data]);
        await axios.post("https://da12cbf1-ea38-4684-8c59-5cec89c3f728.mock.pstmn.io/input",list).then(
            response=>{
                console.log(list);        
            })
        const answer = await axios.get("https://64015d57-ae66-4061-9d92-c81956d3738e.mock.pstmn.io/test");
        setIntake(answer.data.data.intake);
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
    // id, num e.target.value으로 바꾸기