import React, {useState, useCallback} from 'react';

const InputMedicine = ({onInsert}) => {
    const [weight,setWeight] = useState('');
    const [wtime,setWtime] = useState(false);
    const [name,setName] = useState('');
    const [intake,setIntake] = useState('');

    const onChangeWeight = useCallback(e=>{
        setWeight(e.target.value);
    },[]);
    const onChangeName = useCallback(e=>{
        setName(e.target.value);
    },[]);
    const onChangeIntake = useCallback(e=>{
        setIntake(e.target.value);
    },[]);

    let MediForm = new FormData();
    const onSubmit = useCallback(e=>{
        setWtime(true);
        MediForm.append('weight',weight);
        MediForm.append('name',name); 
        MediForm.append('intake',intake); 

        console.log(weight);
        console.log(name);
        console.log(intake);

        onInsert(MediForm);
        setName('');
        setIntake('');
        e.preventDefault();
    },[onInsert,MediForm]);

    return(
        <form onSubmit={onSubmit}>
            {wtime ? 
            <input type="number" placeholder="몸무게(kg)" value={weight} onChange={onChangeWeight} disabled/>
        :<input type="number" placeholder="몸무게(kg)" value={weight} onChange={onChangeWeight} />}
            <input type="text" placeholder="약품명" value={name} onChange={onChangeName}/>
            <input type="number" placeholder="섭취량" value={intake} onChange={onChangeIntake}/>
            <button type="submit">+</button>
        </form>
    );}

export default InputMedicine;