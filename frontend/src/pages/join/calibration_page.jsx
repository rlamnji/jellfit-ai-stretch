// 자세 캘리브레이션 페이지
// 상단 컴포
// 카메라 컴포
import CameraScreen from "../../components/camera/camera_screen";

function CalibrationPage(){
    return (
        <div>
            <div className='w-full h-screen flex flex-col items-center '>
                <div className='header w-fit h-fit p-1 text-[#552F2F] text-[50px] mt-14'>
                    초기 자세 캘리브레이션
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-[850px] h-[90px] pl-8 mt-4 bg-[#FFF1D5] rounded-[40px]">
                        
                        <div className='text-[#552F2F] text-[16px]'>
                            서비스 이용을 위한 기준 자세를 등록하고, 시스템과 사용자의 자세 기준을 일치시키는 과정입니다.<br></br>
                            카메라를 통해 정자세와 T자 자세를 자동으로 인식하고 감지되면 사진이 자동으로 캡처되어 저장됩니다.
                        </div>
                    </div>

                    <div className="text-[#583B3B] text-[30px] mt-4">
                        * 윤곽선에 맞춰 바른 자세로 앉아주세요. *
                    </div>

                    {/* 카메라 <CameraComponent />컴포넌트 */}
                    <CameraScreen/>
                </div>
            </div>
        </div>
    );
}

export default CalibrationPage;