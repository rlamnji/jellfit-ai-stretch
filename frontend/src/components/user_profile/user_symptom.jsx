// 통증선택 
import { useState } from "react";

function Symptom({setIsSymptomModalOpen}){

    return (
        <div className=" z-10 flex flex-col justify-start w-[550px] h-[200px] top-3 left-11">
            <div className='flex w-[200px] h-[50px] bg-[#7A7668] rounded-2xl justify-center items-center cursor-pointer' onClick={() => setIsSymptomModalOpen(true)}>
                <div className='text-[20px] text-white text-center'>통증 부위</div>
            </div>

            <div className='flex flex-col gap-2 text-start text-[#694B4B] text-[20px] pt-4 h-[120px] w-[600px]'>
                <div className="mb-2 ml-5 flex flex-row gap-5">
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center'>
                        <div className='text-[20px] text-[#7E6161] text-center'>거북목</div>
                    </div>
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center'>
                        <div className='text-[20px] text-[#7E6161] text-center'>거북목</div>
                    </div>
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center'>
                        <div className='text-[20px] text-[#7E6161] text-center'>거북목</div>
                    </div>
                </div>
                <div className="mb-2 ml-28 flex flex-row gap-5 ">
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center'>
                        <div className='text-[20px] text-[#7E6161] text-center'>거북목</div>
                    </div>
                    <div className='flex w-[150px] h-[50px] bg-[#FFF1D5] opacity-40 rounded-3xl justify-center items-center'>
                        <div className='text-[20px] text-[#7E6161] text-center'>거북목</div>
                    </div>
                </div>                
            </div>

        </div>
    );
}

export default Symptom;