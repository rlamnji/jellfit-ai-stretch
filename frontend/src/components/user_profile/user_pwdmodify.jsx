// 상세프로필 수정 (비번 변경)
import React, { useState } from 'react';

function PwdModify(){
    const [isVisible, setIsVisible] = useState(false); // 비밀번호 변경 버튼 클릭 시 투명도 해제

    return (
        <div className="z-10 flex flex-col justify-start w-[300px] h-[400px] top-3 left-11 ">

            {/* 비밀번호 변경 버튼 클릭 시 투명도 해제*/}
             <div className='flex w-[200px] h-[50px] bg-[#7A7668] rounded-2xl justify-center items-center cursor-pointer'
             onClick={() => setIsVisible(!isVisible)}>
                <div className='text-[20px] text-white text-center'>비밀번호 변경</div>
             </div>

            <div className={`${isVisible ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className='items-start  pt-4'>
                    <div className='text-[20px] text-[#684E4E] font-bold text-start pb-2'>
                        현재 비밀번호
                    </div>
                    <input
                    type="text"
                    placeholder="현재 비밀번호를 입력하세요."
                    className="text-[15px] h-[10px] w-[300px] px-10 py-6 border bg-white opacity-30 rounded-full"
                    />
                </div>

                <div>
                    <div className='text-[20px] text-[#684E4E] font-bold text-start pt-2 pb-2'>
                        새 비밀번호
                    </div>
                    <div className='pb-2'>
                        <input
                        type="text"
                        placeholder="새 비밀번호를 입력하세요."
                        className="text-[15px] h-[10px] w-[300px] px-10 py-6 border bg-white opacity-30 rounded-full"
                        />
                    </div>
                    <div className='pb-4'>
                        <input
                        type="text"
                        placeholder="새 비밀번호를 한 번 더 입력하세요."
                        className="text-[15px] h-[10px] w-[300px] px-10 py-6 border bg-white opacity-30 rounded-full"
                        />
                    </div>
                    <div className='flex justify-center'>
                        <div className='flex w-[100px] h-[50px] bg-[#552F2F] rounded-2xl justify-center items-center cursor-pointer'>
                            <div className='text-[20px] text-white text-center'>변경</div>
                        </div>
                    </div>


                </div>
            </div>


        
        </div>
    );
}

export default PwdModify;