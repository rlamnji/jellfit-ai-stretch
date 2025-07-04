// 스트레칭 완료 모달창
// 테스트 : self_stretch_page.jsx 에 5초 후 자동 렌더링
import { useNavigate } from 'react-router-dom';
import stretchModal from '../../../assets/images/icons/setting_content.png'
import complteCheck from '../../../assets/images/etc/check.png'
function StretchModal({onClose, completedStretchings, duration}){
    const navigator = useNavigate();
    // 시간 계산 (초단위로 들어옴)
    function formatDuration(duration) {
        const min = Math.floor(duration / 60);
        const sec = duration % 60;

        const paddedMin = String(min).padStart(2, "0");
        const paddedSec = String(sec).padStart(2, "0");

        return `${paddedMin}분 ${paddedSec}초`;
    } 

    return(
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[9999888] flex justify-center items-center pointer-events-auto">
            <div className="relative overflow-hidden">
                <img src={stretchModal} className="w-[700px] h-[700px] object-contain block"/>

                <div className="flex flex-col absolute top-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='text-[#455970] text-[45px] tracking-widest font-bold'>수고하셨습니다!</div>
                    <div className='text-[#506175] text-[27px] mt-2'>
                        스트레칭이 종료되었습니다!
                    </div>
                    <div className='bg-[#9299A4] w-[500px] h-[1px] mt-6'></div>
                </div>
                
                <div className="abolute z-[1000]">
                    <div className="flex flex-col absolute top-52 left-1/2 -translate-x-1/2 w-[500px] h-[300px]  overflow-y-auto gap-3 p-2 rounded-xl">
                        {completedStretchings.map((stretching, index) => (
                        <div
                            key={index}
                            className='flex flex-row justify-between bg-[#FFFCFA] h-20 min-h-20 max-h-20 flex-shrink-0 z-[1000] rounded-2xl items-center'
                        >
                            <div className='rounded-full bg-[#0C8D1B] w-7 h-7 ml-7 flex items-center justify-center'>
                            <img src={complteCheck} className='w-6 h-6' alt="check" />
                            </div>
                            <div className='text-[#455970] font-bold text-[30px] text-center mr-10 w-64'>
                            {stretching.name}
                            </div>
                            <div className='bg-[#38566C] rounded-2xl text-white font-bold text-[30px] text-center w-28 p-1 mr-8'>
                            {stretching.repeatCount} 회
                            </div>
                        </div>
                        ))}

                    </div>
                </div>

                <div className="flex flex-col absolute bottom-28 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='text-[#455970] text-[30px] w-[500px] font-semibold'>총 <span className='text-[55px] font-extrabold'>{formatDuration(duration)}</span> 달성!</div>
                </div>
                <div className="flex flex-col absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='bg-[#D9D5D3] rounded-2xl text-black font-bold p-2 text-[30px] w-[250px] cursor-pointer'
                                    onClick={onClose}
                    >홈으로</div>
                </div>

            </div>
        </div>
    );
}

export default StretchModal;