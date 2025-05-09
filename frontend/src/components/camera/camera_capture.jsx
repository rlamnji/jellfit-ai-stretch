import { useRef, useEffect } from "react";

function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. 카메라 연결
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("❌ 카메라 연결 실패:", err);
      });
  }, []);

  // 2. 프레임 캡처해서 서버로 전송
  const sendFrame = async () => {
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

      try {
        const response = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log("✅ 서버 응답:", result);
      } catch (err) {
        console.error("❌ 서버 전송 실패:", err);
      }
    }, "image/jpeg");
  };

  // 3. 일정 간격으로 프레임 전송
  useEffect(() => {
    const interval = setInterval(sendFrame, 2000); // 2초마다 전송
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, []);

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
        ref={canvasRef}
        width="640"
        height="480"
        className="hidden"
      />
    </div>
  );
}

export default CameraCapture;