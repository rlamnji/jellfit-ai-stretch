// 자세 캘리브레이션 페이지
// 상단 컴포
// 카메라 컴포
import CameraCaliScreen from "../../components/camera_cali/camera_cali_screen";
import SoundBtn from "../../components/buttons/sound_btn";

// 이미지
//import cloudeL from '../../assets/images/etc/cloud_left.png'
//import cloudeR from '../../assets/images/etc/cloud_right.png'



function CalibrationPage(){
    return (
        
        <div className="bg-[#BDDDE4]">

            <div className='flex flex-row justify-end'>
                <SoundBtn/>
            </div>

            <div className='w-full h-screen flex flex-col items-center '>
                <div className='header w-fit h-fit p-1 text-[#552F2F] text-[50px] mt-14 font-bold'>
                    초기 자세 캘리브레이션
                </div>
                <div className="flex flex-col items-center justify-center text-center h-[800px] w-[1200px]">
                    <div className="flex w-[850px] h-[90px] pl-8 mt-4 bg-[#FFF1D5] rounded-[40px] justify-center items-center">
                        
                        <div className='text-[#552F2F] text-[16px] text-center'>
                            서비스 이용을 위한 기준 자세를 등록하고, 시스템과 사용자의 자세 기준을 일치시키는 과정입니다.<br></br>
                            카메라를 통해 <span className="text-[18px] font-bold">정자세</span>와 <span className="text-[18px] font-bold">T자 자세</span>를 자동으로 인식하고 감지되면 사진이 <span className="text-[18px] font-bold">자동으로 캡쳐</span>되어 저장됩니다.
                        </div>
                    </div>

                    {/* 구름 및 해파리 이미지 */}
                    {/*<div className="absolute top-[60px] right-[300px]">
                        <img src={cloudeL} className="w-[280px] h-[200px] animate-moveing"/>
                    </div>
                    <div className="absolute top-28 left-[400px]">
                        <img src={cloudeR} className="w-[200px] h-[200px] animate-moveing"/>
                    </div>*/}

                    <div className="text-[#583B3B] text-[30px] mt-4 animate-flash">
                        * 윤곽선에 맞춰 바른 자세로 앉아주세요. *
                    </div>

                    {/* 카메라 <CameraComponent />컴포넌트 */}
                    <CameraCaliScreen/>
                </div>
            </div>
        </div>
    );
}

export default CalibrationPage;