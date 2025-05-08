// 통증선택 

function Symptom(){
    return (
        <div className="flex flex-col justify-start w-[300px] h-[400px] top-3 left-11 z-10 ">
            <div className='flex w-[200px] h-[50px] bg-[#7A7668] rounded-2xl justify-center items-center'>
                <div className='text-[20px] text-white text-center'>이용 약관</div>
            </div>

            <div className='text-start text-[#694B4B] text-[20px] pt-4 bg-slate-500 h-[120px] w-[600px]'>
                <div className="mb-2"> 나중에 수정 </div>
            </div>
        
        </div>
    );
}

export default Symptom;