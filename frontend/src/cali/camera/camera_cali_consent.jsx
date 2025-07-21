function CameraCaliConsent({ onAllow }) {
    const requestCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // 권한 확인 후 정지
        onAllow(); // 승인되면 부모에게 신호
      } catch (err) {
        alert("카메라 권한이 거부되었습니다.");
        console.error(err);
      }
    };
  
    return (
      <div className="w-full flex flex-col items-center py-4 overflow-y-hidden">
        <div className="relative w-full max-w-[1000px] h-full max-h-[430px] aspect-[16/9]">
          {/* 권한 요청 안내 영역 (카메라 대신 회색 박스) */}
          <div className="absolute top-0 left-0 w-full h-full rounded-xl transform scale-x-[-1] border-2 border-gray-500 border-dashed opacity-40" />
          
          {/* 텍스트 안내 */}
          <div className="absolute text-[25px] text-white font-semibold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            📸 카메라 권한이 필요합니다!
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col justify-around mb-9">
          <button
            onClick={requestCameraAccess}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            카메라 접근 허용
          </button>
        </div>
      </div>
    );
  }

  export default CameraCaliConsent;
  