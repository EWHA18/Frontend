import axios from 'axios';
import React,{Component, useState} from 'react';

const FileUpload = () => {
    const [selectedFile,setSelectedFile] = useState(null);
	const onFileChange = e => {
        setSelectedFile(e.target.files[0]);
	};
	const onFileUpload = () => {
        const formData = new FormData();
        formData.append("file",selectedFile,selectedFile.name);
        console.log(selectedFile);
        axios.post("http://localhost:5000/api/sendfile", formData);
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
    else {
		return (
		<div>
			<h4>Choose before Pressing the Upload button</h4>
		</div>
		);
	}};
		
	return (
		<div>
			<h3>File Upload using React!</h3>
			<div>
				<input type="file" onChange={onFileChange} />
				<button onClick={onFileUpload}>
				Upload!
				</button>
			</div>
		{fileData()}
		</div>
	);
	}

export default FileUpload;
