import { useState } from "react";

function InputField({id, title, type, placeholder, onTextChange}){
    const [text, setText] = useState('');
    const onChange = (e) =>{
        setText(e.target.value);
        onTextChange(e.target.value);
    }
    return (
        <div>
            <div>{title}</div>
            <input id={id} value={text} type={type} placeholder={placeholder} onChange={onChange} />
        </div>
    );
}

export default InputField;