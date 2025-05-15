// 캐릭터 획득 모달
// 획득하면 저거 세트로 저장해서 사용자 캐릭터 테이블에 업뎃해야함

import { useNavigate } from 'react-router-dom';
import stretchModal from '../../../assets/images/icons/setting_content.png'
function CharacterModal(){
    const navigator = useNavigate();

    return(
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[9999888] flex justify-center items-center pointer-events-auto">
            <div className="relative overflow-hidden">
                <img src={stretchModal} className="w-[800px] h-[800px] object-contain block"/>

                <div className="flex flex-col absolute top-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='text-[#455970] text-[45px] tracking-widest font-bold'>축하드립니다!</div>
                    <div className='text-[#506175] text-[27px] mt-2'>
                        해파리획득!
                    </div>
                    <div className='bg-[#9299A4] w-[500px] h-[1px] mt-6'></div>
                </div>
                
                <div className="abolute z-[1000]">
                    <div className="flex absolute top-52 left-1/2 -translate-x-1/2 p-2 rounded-xl">
                        <div className='bg-[#FFFCFA] w-64 h-64 z-[1000] rounded-2xl items-center'>
                            
                        </div>

                    </div>
                </div>

                <div className="flex flex-col absolute bottom-32 left-1/2 -translate-x-1/2 z-[1000] text-center items-center gap-2">
                    <div className='text-[#455970] text-[40px] w-[500px] font-semibold'>머리에 셔틀콕을 얹은 해파리</div>
                    <div className='text-[#455970] text-[20px] w-[500px] h-24 flex items-center justify-center'>2◎421년 제 32회 해파리 스트레칭난에서 부상투혼을 해버린 해파리. 어딘지 모를 [ 비장함 ]이 느껴진다..</div>
                </div>
                <div className="flex flex-col absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='bg-[#D9D5D3] rounded-2xl text-black font-bold p-2 text-[30px] w-[250px] cursor-pointer'
                                    onClick={()=>navigator('/home')}
                    >홈으로</div>
                </div>

            </div>
        </div>
    );
}

export default CharacterModal;