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
        <div className='relative w-[1200px] h-[600px]'>
          <div className="absolute top-0 left-0 w-full h-full rounded-xl transform scale-x-[-1] border-2 border-gray-500 border-dashed opacity-40"></div>
          <div className="absolute text-[25px] text-gray-500 font-semibold top-[250px] left-1/2 -translate-x-1/2">📸 카메라 권한이 필요합니다!</div>
        </div>
        <div className="flex flex-col justify-around">
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
  