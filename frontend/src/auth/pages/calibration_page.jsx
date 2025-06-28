// 자세 캘리브레이션 페이지
import CameraCaliScreen from "../../components/camera_cali/camera_cali_screen";
import TopBar from "../../components/top_bar";
import background from '../../assets/images/etc/basic_background.png';
// 이미지
import cloudeL from '../../assets/images/etc/cloud_left.png'
import cloudeR from '../../assets/images/etc/cloud_right.png'
import { useEffect, useState } from "react";

function CalibrationPage() {
  const [showGuideModal, setShowGuideModal] = useState(true); // 캘리브레이션 모달 표시 여부

  useEffect(() => {
    // 페이지가 로드될 때 가이드 모달을 표시합니다.
    if(!showGuideModal) return; 
  }, []);

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
                카메라를 통해 <span className="text-[18px] font-bold">정자세</span>를 자동으로 인식하고 감지되면 사진이 <span className="text-[18px] font-bold">자동으로 캡쳐</span>되어 저장됩니다.
                </div>
            </div>
        </div>

        <div className="text-[#e5e1e1] text-[30px] mb-4 mt-3 animate-flash">
          * 윤곽선에 맞춰 바른 자세로 앉아주세요. *
        </div>

        {/* 카메라 컴포넌트 */}
        <CameraCaliScreen />
      </div>

      {/* 캘리브레이션 모달 */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">📸 사용 방법 안내</h2>
            <p className="mb-4 text-gray-700 text-lg">
              이 화면은 자세 측정(캘리브레이션)을 위한 페이지입니다.<br></br>
              화면의 안내에 따라 <strong>정자세</strong>를 정확히 취해 주세요.<br></br>
             특히 <strong className="text-blue-600">십자 가이드라인의 교차점</strong>에 턱끝이 오도록 정렬해 주세요.<br></br>
            </p>
            <button
              onClick={() => setShowGuideModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalibrationPage;





