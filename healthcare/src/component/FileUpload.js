import axios from 'axios';
import React, { useState, useRef, useCallback } from 'react';
import {Link, Route} from 'react-router-dom';
import '../index.css';

const FileUpload = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [intake, setIntake] = useState([]);
	const [heavy, setHeavy] = useState([]);
	const [total, setTotal] = useState([]);
	const [name, setName] = useState([]);
	const [checked,setCheck] = useState([]);
	const [index, setIndex] = useState([]);
	const [show_state,setShow] = useState([]);
	const [data,setData] = useState([]);         // result 그 자체
	const [result,setResult] = useState(false);  // CSV 결과파일 저장 - CSV 결과 반환 유무 
	const onFileChange = e => {
		setSelectedFile(e.target.files[0]);
	};
	const onFileUpload = () => {
		const formData = new FormData();
		formData.append("file", selectedFile, selectedFile.name);
		console.log(selectedFile);
		axios.post("http://localhost:5000/api/sendfile", formData).then(
			async response => {
				console.log(response.data.data);
				setData(response.data.data);
				let temp_name = [];
				let temp_data = [];
				let temp_index = [];
				let temp_heavy=[];
				for (let i = 0; i < response.data.data.length; i++) {
					temp_name.push(response.data.data[i].name);
					temp_data.push(response.data.data[i].intake);
					temp_index.push(i);
					temp_heavy.push(response.data.data[i].intake.filter(f=>f.isHeavyMetal==true));
				} setName(temp_name);
				setHeavy(temp_heavy);
				setIntake(temp_data);
				setTotal(temp_data);
				setIndex(temp_index);
				setCheck(false);
				setShow("중금속만 보기");
				setResult(true);
			});
	};

	const fileData = () => {
		if (selectedFile) {
			return (
				<div>
					<h2>File Details:</h2>
					<p>File Name: {selectedFile.name}</p>
					<p>Last Modified:{" "}
						{selectedFile.lastModifiedDate.toDateString()}
					</p>
				</div>
			);
		}
	};
	const heavy_button = () => {
		if(!checked){
		  setTotal(heavy);
		  setCheck(true);
		  setShow("전체 보기");
		}else{
		  setTotal(intake);
		  setCheck(false);
		  setShow("중금속만 보기");
		}
	  }
	
	const onSaveResult = () => {
		axios({
			url: 'http://localhost:5000/api/exportFile', //your url
			method: 'POST',
			data: data,
			responseType: 'blob', // important
		  })
	.then((response) => {
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'result.csv'); //or any other extension
		document.body.appendChild(link);
		link.click();
	 });
	} 
	return (
		<div>
			<div className="header">
				<h1>건강기능식품 프로젝트</h1>
				<Link to = '/'><span className="usermode">(다수)사용자 CSV 파일 입력</span></Link>
			</div>
			<div className="body">
				<div className="form">
				<h3>사용자의 약품 내역을 파일로 업로드해보세요!</h3><br />
				<input type="file" onChange={onFileChange}/>
				<button onClick={onFileUpload}>파일 업로드</button>
				{result ? <button className="saveBtn" onClick={onSaveResult}>결과 저장</button> : <p></p>}
				<button className="heavyBtn" onClick={heavy_button}>{show_state}</button>
				</div>

				<div className="input">
				<h3>Input</h3>
				{fileData()}
				</div>
				<div className="output">
				<h3>Output</h3>
					{index.map(i => (
					<div>
						<p>이름: {name[i]}</p>
						{total[i].map(t => <li key={t.word_name}>{t.word_name} {t.volume} {t.unit} 
						{t.percentage==0 ? <p/> : ' ('+(100+Math.round(t.percentage*1000)/1000).toFixed(3)+'%)'}  </li>)} <br/>
					</div>
				))}
				</div>
				
			</div>
		</div>
	);
}
export default FileUpload;
