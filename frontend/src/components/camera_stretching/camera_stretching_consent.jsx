function CameraStretchingConsent({ onAllow }) {
  const requestCameraAccess = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === "videoinput");

      if (!hasCamera) {
        alert("카메라가 감지되지 않았습니다.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // 권한 확인 후 스트림 정지
      onAllow(); // 권한 허용 시 부모 컴포넌트에 알림
    } catch (err) {
      alert("카메라 권한이 거부되었습니다.");
      console.error(err);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">카메라 권한 요청</h1>
      <p className="text-gray-600 mb-6">카메라를 사용하려면 권한을 허용해주세요.</p>
      <button
        onClick={requestCameraAccess}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        카메라 권한 허용
      </button>
    </div>
  );
}

export default CameraStretchingConsent;