// 자세교정 모드 실행 전 안내 팝업창
import { useEffect,useState } from 'react';

import BackgroundModeModal from '../../../assets/images/icons/home/background_mode_content.png';
import setCancel  from '../../../assets/images/icons/cancel.png';
import badPose1 from '../../../assets/images/icons/home/background_bad_pose_1.png';
import badPose2 from '../../../assets/images/icons/home/background_bad_pose_2.png';
import { useNavigate } from 'react-router-dom';

// 나중에 로그아웃할때 showpopup false로 변경해주는 함수 작성할 것
function BackgroundModal({setOpenModal,  showPopup, setShowPopup, /*cameraStarted, setCameraStarted*/}) {
    const navigate = useNavigate();
    
    const [cameraStarted, setCameraStarted] = useState(false);

    const handleClose = () => {
        // 로그아웃 연결 시 추가
        /*if (showPopup) {
            sessionStorage.setItem("hidePopupDuringSession", "true");
        }*/
        setOpenModal(false);
    };

    const closeModal = () => {
        
    };

    const startBackgroundMode = () => {
        closeModal();

        if (window.api && window.api.startPostureMode) {
            window.api.startPostureMode(); //카메라 창 켜짐.

        } else {
            console.error('Electron API가 정의되지 않았습니다.');
        }

        setCameraStarted(true);
    };

    /*const startBackgroundMode = () => {
        // 로그아웃 연결 시 추가
        /*if (showPopup) {
            localStorage.setItem("showPopup", "true");
        }

        setOpenModal(false);
        // 카메라 시작
        setTimeout(() => {
            setCameraStarted(true);
            console.log(cameraStarted);
        }, 200);
    };*/
    
  
  return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[9999888] flex justify-center items-center pointer-events-auto">
            <div className="relative overflow-hidden">
                <img src={BackgroundModeModal} className="w-[950px] h-full object-contain block"/>

                {/* 취소 버튼 */}
                <div className="absolute top-[15px] right-[20px] w-[40px] bg-none border-none cursor-pointer z-[1000]">
                    <img src={setCancel}   onClick={() => { handleClose() }}/>
                </div>

                <div className='absolute top-[47%] left-1/2 -translate-x-1/2 flex flex-row gap-14 z-[1000] '>
                    <div className='flex flex-col text-center items-center w-[160px] h-[160px]'>
                        <img className='w-[550px]' src={badPose2}/>
                        <div className='text-[#343434] text-[20px] font-bold'>좌우 비대칭 자세</div>
                    </div>
                    <div className='flex flex-col text-center items-center w-[160px] h-[160px]'>
                        <img className='w-[550px]' src={badPose1}/>
                        <div className='text-[#343434] text-[20px] font-bold'>거북목 자세</div>
                    </div>
                    <div className='flex flex-col text-center items-center w-[160px] h-[160px]'>
                        <img className='w-[550px]' src={badPose2}/>
                        <div className='text-[#343434] text-[20px] font-bold'>좌우 비대칭 자세</div>
                    </div>
                </div>

                 {/* 시작 버튼 */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-center bottom-6 w-[230px] h-[60px] bg-[#343434] text-white font-bold text-[28px] rounded-2xl cursor-pointer z-[1000]"
                    onClick={()=>startBackgroundMode()}>
                    시작하기
                </div>


                {/* 오늘 하루동안 보지 않기 */}
                <div className='absolute flex flex-row items-center left-3/4 bottom-6 z-[1000] gap-2 cursor-pointer'>
                    <div className={`rounded-sm w-5 h-5
                        ${showPopup ? "bg-[#5C5C5C]" : "bg-none border border-[#5C5C5C]" }`
                    }
                    onClick={()=>{setShowPopup(prev => !prev); }}></div>
                    <div className="text-[#5C5C5C] text-[18px]">
                        오늘 하루동안 보지 않기
                    </div>
                </div>

      
            </div>
        </div>
  );
}

export default BackgroundModal;