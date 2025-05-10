// 자세 측정
import { useRef, useEffect, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const guideCanvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const [step, setStep] = useState("posture");


  const expectedPoseYMap = {
    // 정자세
    posture: {
      leftShoulder: 0.66,
      rightShoulder: 0.66,
    },
    // T자세
    tpose: {
      leftShoulder: 0.55,
      rightShoulder: 0.55,
      leftWrist: 0.52,
      rightWrist: 0.52,
    },
  };


  // 카메라 켜기
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("❌ 카메라 연결 실패:", err);
    }
  };

  // 카메라 끄기
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
      console.log("📴 카메라 꺼짐");

      // 윤곽선 canvas도 지우기
      const guideCanvas = guideCanvasRef.current;
      const ctx = guideCanvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
      }
    }
  };


  // 가이드선 그리기
  useEffect(() => {
    const guideCanvas = guideCanvasRef.current;
    const ctx = guideCanvas.getContext("2d");

    const drawGuide = () => {
      ctx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
      if (!isCameraOn) return; 

      ctx.lineWidth = 4;

      if (step === "tpose") {
        ctx.strokeStyle = "rgba(255, 165, 0, 0.5)";
        const y = guideCanvas.height * 0.55;

        ctx.beginPath();
        ctx.moveTo(guideCanvas.width * 0.1, y);
        ctx.lineTo(guideCanvas.width * 0.9, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(guideCanvas.width / 2, y - 100);
        ctx.lineTo(guideCanvas.width / 2, y + 120);
        ctx.stroke();

      } else if (step === "posture") {
        ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
        const y = guideCanvas.height * 0.66;

        ctx.beginPath();
        ctx.moveTo(guideCanvas.width * 0.4, y);
        ctx.lineTo(guideCanvas.width * 0.6, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(guideCanvas.width / 2, y - 80);
        ctx.lineTo(guideCanvas.width / 2, y + 100);
        ctx.stroke();
      }
    };

    drawGuide();
  }, [step, isCameraOn]);



  useEffect(() => {
    if (!videoRef.current) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // posture 한 번만 실행
    let postureDetected = false;

    pose.onResults((results) => {
      if (!results.poseLandmarks) return;

      const getY = (idx) => results.poseLandmarks[idx]?.y ?? 0;

      if (step === "posture") {
        const isAligned =
          Math.abs(getY(11) - 0.66) < 0.07 &&
          Math.abs(getY(12) - 0.66) < 0.07;

        if (isAligned && !postureDetected) {
          postureDetected = true; // 한 번만 실행
          console.log("✅ 정자세 일치!");
          setTimeout(() => {
            console.log("➡️ T자 자세로 전환");
            setStep("tpose");
          }, 2000);
        }
      }

      if (step === "tpose") {
        const isAligned =
          Math.abs(getY(11) - 0.55) < 0.07 &&
          Math.abs(getY(12) - 0.55) < 0.07 &&
          Math.abs(getY(15) - 0.55) < 0.07 &&
          Math.abs(getY(16) - 0.55) < 0.07;

        if (isAligned) {
          console.log("✅ T자 자세 일치!");
          console.log("✅ 자세 캘리브레이션 종료");
        }
      }
    });



     // 2. 프레임 캡처해서 서버로 전송
  /*const sendFrame = async () => {
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
  };*/


    const cam = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 1280,
      height: 720,
    });

    cam.start();
    }, [step]);

  return (
    <div className="w-full flex flex-col items-center py-4 overflow-y-hidden">
      <div className="relative w-[1200px] h-[600px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-full rounded-xl transform scale-x-[-1]"
        />
        <canvas
          ref={guideCanvasRef}
          width="1200"
          height="600"
          className="absolute top-0 left-0 z-10 pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          width="1200"
          height="600"
          className="hidden"
        />
        {/* 자세 측정 알림 UI 추후 수정
        {step==="start_message" && (
          <div className="fade-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 text-xl font-semibold px-6 py-3 rounded-xl shadow">
            정자세 측정을 시작합니다!
          </div>
        )}
        {step === "message" && (
          <div className="fade-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 text-xl font-semibold px-6 py-3 rounded-xl shadow">
            정자세 완료! T자 자세로 이동합니다.
          </div>
        )}
        {step==="end_message" && (
          <div className="fade-in-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 text-xl font-semibold px-6 py-3 rounded-xl shadow">
            T자 자세 완료! 자세 캘리브레이션을 종료합니다!
          </div>
        )}*/}

      </div>

      <div className="flex flex-row justify-around gap-4">
        <button
          onClick={isCameraOn ? stopCamera : startCamera}
          className={`mt-4 px-6 py-2 ${
            isCameraOn
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white rounded-lg shadow`}
        >
          {isCameraOn ? "카메라 끄기" : "카메라 켜기"}
        </button>
      </div>
    </div>
  );
}

export default CameraCapture;
