import { useRef, useEffect } from "react";

function CameraStretchingCapture({ handleIsStretching, sendFrameTime , stretchingId}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // canvasRef 초기화
  const streamRef = useRef(null); // 스트림을 저장할 ref

  // 1. 카메라 연결
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream; // 스트림 저장
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("❌ 카메라 연결 실패:", err);
      });

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        console.log("✅ 카메라 스트림 정지");
      }
    };
  }, []);

  // 2. 프레임 캡처해서 서버로 전송
  const sendFrame = async ({ stretchingId }) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");

    // ✅ 좌우 반전 없이 원본 방향으로 캡처
    ctx.setTransform(1, 0, 0, 1, 0, 0); // transform 초기화
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 이미지 서버로 전송
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
      formData.append("pose_id", stretchingId);

      try {
        const res = await fetch("http://localhost:8000/guide/analyze", {
          method: "POST",
          body: formData,
        });
        if(res.ok){
          const { isStretching } = await res.json();
          console.log("✅ 서버 응답:", isStretching);
          handleIsStretching(isStretching);
        }
      } catch (err) {
        console.error("❌ 서버 전송 실패:", err);
      }
    }, "image/jpeg");
  };

  // 3. 일정 간격으로 프레임 전송
  useEffect(() => {
  const interval = setInterval(() => {
    sendFrame({ stretchingId });  // sendFrame 자체가 async이므로 여기선 그냥 호출만
  }, sendFrameTime);

  return () => clearInterval(interval);
}, [stretchingId]);

  return (
    <div className="w-full flex flex-col items-center py-4">
      {/* ✅ 사용자에게 거울처럼 보이는 비디오 */}
      <video
        ref={videoRef}
        autoPlay
        className="w-[640px] h-[480px] border rounded-xl transform scale-x-[-1]"
      />

      {/* 👻 서버 전송용 캔버스 (사용자에겐 숨김) */}
      <canvas
        ref={canvasRef} // canvasRef 연결
        width="640"
        height="480"
        className="hidden"
      />
    </div>
  );
}

export default CameraStretchingCapture;