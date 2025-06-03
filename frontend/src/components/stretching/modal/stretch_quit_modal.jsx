// 스트레칭 중단 시 모달
import { useNavigate } from 'react-router-dom';
import stretchModal from '../../../assets/images/icons/setting_content.png';
import charaterGroup from '../../../assets/model/character_group.png';

function StretchQuitModal({onClose, setLeftElapsedTime, setRightElapsedTime}){
    const navigator = useNavigate();

    const handleQuit = () => { 
        setLeftElapsedTime(0);
        setRightElapsedTime(0);
        navigator('/home');
    };

    return(
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[9999888] flex justify-center items-center pointer-events-auto">
            <div className="relative overflow-hidden">
                <img src={stretchModal} className="w-[800px] h-[800px] object-contain block"/>

                <div className="flex flex-col absolute top-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='text-[#455970] text-[45px] tracking-widest font-bold'>스트레칭을 <br></br>그만두시겠습니까?</div>
                    <div className='bg-[#9299A4] w-[500px] h-[1px] mt-6'></div>
                </div>
                
                <div className="abolute z-[1000]">
                    <div className="flex absolute top-52 left-1/2 -translate-x-1/2 p-2 rounded-xl">
                        <div className='bg-[#FFFCFA] w-64 h-64 z-[1000] rounded-2xl items-center'>
                            <img src={charaterGroup}/>
                        </div>

                    </div>
                </div>

                <div className="flex flex-col absolute bottom-32 left-1/2 -translate-x-1/2 z-[1000] text-center items-center gap-2">
                    <div className='text-[#455970] text-[40px] w-[500px] font-semibold'>그만두면 해파리를 <br></br>얻지 못해요</div>
                    <div className='text-[#455970] text-[28px] w-[500px] '>계속 해보는 게 어떨까요?</div>
                </div>
                <div className="flex flex-row absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center gap-3">
                    <div className='bg-[#D9D5D3] rounded-2xl text-black font-bold p-2 text-[30px] w-[250px] cursor-pointer'
                                    onClick={()=>onClose()}
                    >계속하기</div>
                                        <div className='bg-[#343434] rounded-2xl text-white font-bold p-2 text-[30px] w-[250px] cursor-pointer'
                                    onClick={()=>handleQuit()}
                    >그만하기</div>
                </div>

            </div>
        </div>
    );
}

export default StretchQuitModal;