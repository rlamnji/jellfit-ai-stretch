// 통증선택 
import { useState } from "react";
import github from "../../assets/images/etc/github.png";
import notion from "../../assets/images/etc/notion.png";

function Symptom({setIsSymptomModalOpen}){

    const clickHandler = () => {
        window.open("https://github.com/minJOO03210/jellfit", "_blank");
    };

    const clickHandler2 = () => {
        window.open("https://www.notion.so/JellFit-1b410e0a358a80d8b30ae322cb828271?source=copy_link", "_blank");
    };

    return (
        <div className=" z-10 flex flex-col justify-start w-[550px] h-[200px] top-3 left-2 mt-20">
            <div className='flex w-[200px] h-[50px]opacity-35 justify-start items-center'>
                <div className='text-[25px] text-[#7A7668] text-center font-bold'>개발 정보</div>
            </div>

            <div className='flex flex-col gap-2 text-start text-[#694B4B] text-[20px] pt-2 h-[120px] w-[600px]'>
                <div className="mb-2 ml-5 flex flex-row gap-5">
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center cursor-pointer'  onClick={clickHandler}>
                        <img src={github} className='w-[30px] h-[30px] mr-2' alt="GitHub Logo" />
                        <div className='text-[20px] text-[#7E6161] text-center '>GitHub</div>
                    </div>
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center cursor-pointer' onClick={clickHandler2}>
                        <img src={notion} className='w-[30px] h-[30px] mr-2' alt="Notion Logo" />
                        <div className='text-[20px] text-[#7E6161] text-center' >Notion</div>
                    </div>
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center cursor-pointer' onClick={clickHandler2}>
                        <img src={notion} className='w-[30px] h-[30px] mr-2' alt="Notion Logo" />
                        <div className='text-[20px] text-[#7E6161] text-center' >Notion</div>
                    </div>
                </div>
               
            </div>

        </div>
    );
}

export default Symptom;