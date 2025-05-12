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
      <div className="w-full h-screen flex flex-col justify-center items-center text-center">
        <p className="mb-4 text-lg font-semibold">📸 카메라 권한이 필요합니다</p>
        <button
          onClick={requestCameraAccess}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          카메라 접근 허용
        </button>
      </div>
    );
  }
  
  export default CameraCaliConsent;
  