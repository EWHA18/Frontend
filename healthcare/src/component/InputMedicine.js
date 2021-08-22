import React, {useState, useCallback} from 'react';

const InputMedicine = ({onInsert}) => {
    const [name,setName] = useState('');
    const [intake,setIntake] = useState('');
    const [data,setData] = useState([]);

    const onChangeName = useCallback(e=>{
        setName(e.target.value);
    },[]);
    const onChangeIntake = useCallback(e=>{
        setIntake(e.target.value);
    },[]);

    const onSubmit = useCallback( e => {
        //setData([name,intake]);
        console.log(name);
        console.log(intake);

        onInsert(name);

        setName('');
        setIntake('');
        setData([]);
        e.preventDefault();
    },[onInsert,name]);

    return(
        <form onSubmit={onSubmit}>
            <input placeholder="약품명" value={name} onChange={onChangeName}/>
            <input placeholder="섭취량" value={intake} onChange={onChangeIntake}/>
            <button type="submit">+</button>
        </form>
    );
}

export default InputMedicine;