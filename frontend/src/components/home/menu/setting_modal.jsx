// 환경설정 팝업창
// tailwind 적용
import setModal from '../../../assets/images/icons/setting_content.png';
import setCancel  from '../../../assets/images/icons/cancel.png';
import { useEffect} from 'react';
import { useReminder } from '../../../context/reminder_context';
import { useSound } from '../../../context/sound_context';
import { playAudio, stopAudio } from '../../../utils/sound';

import backgroundMusic from '../../../assets/sounds/track1.mp3';
import DropDown from './drop_down';


function SettingModal ({setOpenModal}){

    const {toggledAlarm, setToggledAlarm}  = useReminder(); // 푸시 알람 상태관리
    const {toggledSound, setToggledSound} = useSound(); // 배경음

    // 초기값 불러오기
    useEffect(() => {
        const savedSound = localStorage.getItem('toggledSound');
        const savedAlarm = localStorage.getItem('toggledAlarm');
        
        if (savedSound !== null) {
            setToggledSound(savedSound === 'true');
        }
        if (savedAlarm !== null) {
            setToggledAlarm(savedAlarm === 'true');
        }

    }, []);

    useEffect(()=>{
        // 배경음이 true일 때만 소리재생
        if(toggledSound){
            playAudio(backgroundMusic);
        }else{
            stopAudio();
        }

    },[toggledSound]);

    // x 버튼 클릭 시 현재 상태 저장
    const handleClose = () => {
        localStorage.setItem('toggledSound', toggledSound.toString());
        localStorage.setItem('toggledAlarm', toggledAlarm.toString());
        setOpenModal(false);
    };



    return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[9999888] flex justify-center items-center pointer-events-auto">
            <div className="relative overflow-hidden"> {/* 환경설정 전체 이미지 */}
                <img src={setModal} className="w-[600px] h-[600px] object-contain block"/>

                {/* 취소 버튼 */}
                <div className="absolute top-[15px] right-[70px] w-[40px] bg-none border-none cursor-pointer z-[1000]">
                    <img src={setCancel}   onClick={() => { handleClose() }}/>
                </div>

                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[1000] text-[#455970] text-[30px] tracking-widest font-bold">
                    환경설정
                    <div className="absolute top-14 bg-[#9299A4] left-1/2 -translate-x-1/2 z-[1000] w-[400px] h-[1px]"></div>

                    {/* 음량 조절, 주기 설정 */}
                    <div className="absolute flex flex-row p-5 top-[70px] bg-[#FFFCFA] w-[430px] h-[150px] left-1/2 -translate-x-1/2 z-[1000] rounded-xl">
                        <div className='flex flex-col text-[20px] w-[210px] font-semibold'>

                            <div className="flex flex-row w-[300px] pb-6 items-center">
                                <div className='pr-3'>배경음</div>

                                <div onClick={() => {
                                        setToggledSound(prev => {
                                            console.log("이전 상태:", prev);
                                            console.log("새 상태:", !prev);
                                            return !prev;
                                        });
                                    }}>
                                    <div className={`w-[90px] h-[40px] rounded-full flex items-center pl-2 cursor-pointer duration-200
                                                ${toggledSound ? "bg-[#6a5251]" : "bg-gray-300"}`
                                                } >
                                        <div className={`w-[35px] h-[35px] rounded-full cursor-pointer transition-colors
                                                            ${toggledSound ? "bg-white translate-x-10" : "bg-white "}`}
                                                            ></div>
                                    </div>
                                    
                                </div>

                            </div>

                            <div className='flex flex-row  w-[300px] items-center'>
                                <div className='pr-3'>푸시알람</div>

                                <div onClick={() => setToggledAlarm(prev => !prev)}>
                                    <div className={`w-[90px] h-[40px] rounded-full flex items-center pl-2 cursor-pointer duration-200
                                        ${toggledAlarm ? "bg-[#6a5251]" : "bg-gray-300"}`} >
                                        <div className={`w-[35px] h-[35px] rounded-full cursor-pointer transition-colors
                                                ${toggledAlarm ? "bg-white translate-x-10" : "bg-white"}`}
                                                ></div>
                                    </div>
                                 </div>
                            </div>
                        </div>

                        <div className='flex flex-row items-top'>
                            <div className='flex flex-col mr-2'>
                                <div className='text-[20px] font-semibold'> 알람주기 </div>
                                <div className='text-[#929292] text-[10px] font-normal text-center'> (스트레칭) </div>                   
                            </div>

                            <DropDown/>
                        </div>              
                    </div>

                    {/* 간단한 스토리 설명 */}
                    <div className="absolute top-[240px] bg-[#FFFCFA] w-[430px] h-[300px] left-1/2 -translate-x-1/2 z-[10] rounded-xl">
                        <div className='absolute top-3 left-1/2 -translate-x-1/2 text-[25px] w-[350px] text-center'>☁ミ✲ J e l l F i t ⋰˚✩</div>
                        <div className="absolute top-14 bg-[#9299A4] left-1/2 -translate-x-1/2 z-[1000] w-[300px] h-[1px]"></div>

                        <div className='absolute top-20 text-[12px] font-normal ml-4'>
                            우주 어딘가, 인간은 알지 못하는 생명체가 유영하고 있다.<br />
                            그들은 언어도, 소리도 없지만<br/>
                            몸의 움직임으로 서로 소통한다.
                            <br/><br/>
                            지구에서 스트레칭을 시작한 순간,<br/>
                            해파리들은 그 진동을 감지한다.<br />
                            그리고 이렇게 말한다.<br/>
                            <br/><br/>
                            <strong className='text-[15px]'>“★εïз⭑ ֺ ๋_는 ㅜ▧ㅜ▧̶̲ .˖ ͘ ▧의ㄴㄴ를■▣▣ ”</strong>
                        </div>

                        <div className="absolute top-[300px] right-0 z-[1000]  text-[10px]">
                            버전정보 1.1v
                        </div>
                        
                    </div>


                </div>



                
            </div>
        </div>
    );

}

export default SettingModal;