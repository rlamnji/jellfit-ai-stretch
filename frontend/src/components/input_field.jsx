import { useState } from "react";

function InputField({id, title, type, placeholder, onTextChange}){
    const [text, setText] = useState('');
    const onChange = (e) =>{
        setText(e.target.value);
        onTextChange(e.target.value);
    }
    return (
        <div className="z-10">
            <div className="font-semibold text-xl text-input-text-color">{title}</div>
            <input className='w-[280px] h-[40px] flex justify-center items-center mt-2 mb-4 pl-2 rounded-[8px] caret-black'id={id} value={text} type={type} placeholder={placeholder} onChange={onChange} />
        </div>
    );
}

export default InputField;