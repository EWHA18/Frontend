import axios from 'axios';
import React, { Component, useState } from 'react';

const FileUpload = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [data,setData] = useState([]);
	const [name,setName] = useState([]);
	const [index,setIndex] = useState([]);
	const onFileChange = e => {
		setSelectedFile(e.target.files[0]);
	};
	const onFileUpload = () => {
		const formData = new FormData();
		formData.append("file", selectedFile, selectedFile.name);
		console.log(selectedFile);
		axios.post("http://localhost:5000/api/sendfile", formData).then(
			async response => {
				let temp_name=[];
				let temp_data=[];
				let temp_index=[];
				for (let i = 0; i < response.data.data.length; i++) {
					temp_name.push(response.data.data[i].name);
					temp_data.push(response.data.data[i].intake);
					temp_index.push(i);
				}setName(temp_name);
				setData(temp_data);
				setIndex(temp_index);
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
	return (
		<div>
			<h3>사용자의 약품 내역을 파일로 업로드해보세요!</h3><br />
			<div>
				<input type="file" onChange={onFileChange} />
				<button onClick={onFileUpload}>
					파일 업로드
				</button>
			</div>
			{fileData()}
			{index.map(i=>(
				<div>
				{name[i]}
				{data[i].map(t=><li>{t.word_name} {t.volume}{t.unit}</li>)}
				</div>
			))}
		</div>
	);
}
/*
				{name[0]}
				{test[0].map(t=><li>{t.word_name} {t.volume}{t.unit}</li>)}
				*/
export default FileUpload;
