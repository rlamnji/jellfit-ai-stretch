// 카메라 켜고 끄기 관련 함수들

export const startCamera = async (videoRef, setIsCameraOn) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    }
  } catch (err) {
    console.error("카메라 접근 실패:", err);
  }
};

export const stopCamera = (videoRef, guideCanvasRef, setIsCameraOn) => {
  if (!videoRef?.current) return;
  const stream = videoRef.current?.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setIsCameraOn(false);
    console.log("📴 카메라 꺼짐");

    const guideCanvas = guideCanvasRef.current;
    const ctx = guideCanvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    }
  }
};
