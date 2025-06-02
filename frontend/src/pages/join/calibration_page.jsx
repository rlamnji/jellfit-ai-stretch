// 자세 캘리브레이션 페이지
import CameraCaliScreen from "../../components/camera_cali/camera_cali_screen";
import TopBar from "../../components/top_bar";
import background from '../../assets/images/etc/basic_background.png';
// 이미지
import cloudeL from '../../assets/images/etc/cloud_left.png'
import cloudeR from '../../assets/images/etc/cloud_right.png'

function CalibrationPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 배경 */}
      <img src={background} className="absolute w-full h-full object-cover z-0" alt="Background" />
      
      <div className="absolute top-0 right-0 w-full h-[60px] z-50 flex justify-end cursor-pointer">
        <TopBar />
      </div>
  
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
        <div className="text-[#342424] text-[50px] font-extrabold mb-6 mt-10 ">
          초기 자세 캘리브레이션
        </div>

        {/* 설명 박스 */}
        <div className="relative w-[850px]">
            {/* 구름 및 해파리 이미지 */}
            <div className="absolute bottom-[-20px] right-[-100px]">
                <img src={cloudeL} className="w-[280px] h-[200px] animate-moveing" />
            </div>
            <div className="absolute bottom-[-25px] left-[-100px]">
                <img src={cloudeR} className="w-[200px] h-[200px] animate-moveing" />
            </div>


            {/* 설명 박스 */}
            <div className="w-full h-[90px] pl-8 bg-[#FFF1D5] rounded-[40px] flex items-center justify-center text-[#552F2F] text-[16px] text-center">
                <div className="text-[#552F2F] text-[17px] text-center">
                서비스 이용을 위한 기준 자세를 등록하고, 시스템과 사용자의 자세 기준을 일치시키는 과정입니다.<br />
                카메라를 통해 <span className="text-[18px] font-bold">정자세</span>와 <span className="text-[18px] font-bold">T자 자세</span>를 자동으로 인식하고 감지되면 사진이 <span className="text-[18px] font-bold">자동으로 캡쳐</span>되어 저장됩니다.
                </div>
            </div>
        </div>

        <div className="text-[#e5e1e1] text-[30px] mb-4 mt-3 animate-flash">
          * 윤곽선에 맞춰 바른 자세로 앉아주세요. *
        </div>

        {/* 카메라 컴포넌트 */}
        <CameraCaliScreen />
      </div>
    </div>
  );
}

export default CalibrationPage;





