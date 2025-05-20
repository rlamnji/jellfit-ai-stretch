// 상세프로필 수정 (이용약관)
import DetailModal from '../../assets/images/icons/detail_user_modal.png';
import setCancel from '../../assets/images/icons/cancel.png';

import { useEffect, useState } from 'react';

function SymptomModal({onClose}){

        return (
            <div className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[99999] flex justify-center items-center pointer-events-auto'>
                
                <div className='relative flex flex-col overflow-hidden'> {/* 통증 전체 이미지 */}
                    <div className=" flex flex-col absolute top-7 left-1/2 -translate-x-1/2 ">
                        <div className='h-[150px]'>
                            <div className='text-[25px] text-[#7E6161] font-bold mb-4 ml-4 mt-2'>통증 부위</div>
                            <div className='flex text-center items-center justify-center text-[20px] bg-[#552F2F] text-white w-[130px] h-[40px] rounded-xl font-semibold mb-4 mt-8'>전체</div>
                            <pre className="font-sans whitespace-pre-wrap w-[400px] h-[400px] overflow-y-auto text-[#85756b] text-[14px] z-[10]">* 최대 5개까지 선택 가능</pre>
                        </div>
                        <div className='flex flex-col mt-8 h-[250px]'>
                            <div className='flex flex-row gap-2 justify-center'>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                            </div>
                            <div className='flex flex-row gap-5 justify-center'>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                            </div> 
                            <div className='flex flex-row gap-2 justify-center'>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                            </div>
                            <div className='flex flex-row gap-5 justify-center'>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                                <div className='flex text-center items-center justify-center text-[20px] bg-[#E2D9C9] text-[#7E6161] w-[120px] h-[50px] rounded-3xl mb-4 cursor-pointer'>거북목</div>
                            </div>                                                                                   
                        </div>

                    </div>


                    <img src={DetailModal} className='w-[600px] h-[600px] object-contain block'/>
                    <div className="absolute w-[40px] top-7 right-[93px] cursor-pointer" onClick={onClose}>
                        <img src={setCancel}/>
                    </div>

                    <div className='absolute bottom-7 left-1/2 -translate-x-1/2'>
                        <div className='flex w-[150px] h-[50px] bg-[#552F2F] rounded-2xl justify-center items-center cursor-pointer'>
                            <div className='text-[20px] text-white text-center'>저장</div>
                        </div>
                    </div>
                    
                </div>
            
            </div>
        );

}

export default SymptomModal;