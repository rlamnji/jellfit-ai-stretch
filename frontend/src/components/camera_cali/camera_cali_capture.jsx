// 자세 측정
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

function CameraCaliCapture() {
  const navigate = useNavigate();
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

  // 페이지이동 테스트 (인식 X)
  useEffect(() => {
  if (isCameraOn) {
    const timer = setTimeout(() => {
      stopCamera();
      alert("캘리브레이션 종료 (임시 테스트)");
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 정리
  }
}, [isCameraOn]);

  // 가이드선 그리기
  useEffect(() => {
    const guideCanvas = guideCanvasRef.current;
    if (!guideCanvas) return;
      const ctx = guideCanvas.getContext("2d");
    if (!ctx) return;
    

    const drawGuide = () => {
      if (!guideCanvas || !ctx) return;
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


  // 프레임 캡처해서 서버로 전송
  const sendFrame = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");

    // 캡처
    ctx.setTransform(1, 0, 0, 1, 0, 0); // transform 초기화
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 이미지 서버로 전송
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

    try {
      console.log("📤 이미지 전송 시작...");
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`서버 응답 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("서버 응답:", result);
    } catch (err) {
      console.error("서버 전송 실패:", err);
    }
    }, "image/jpeg");
  };

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

    let postureStartTime = null;
    let postureSuccess = false;

    let tposeStartTime = null;
    let tposeSuccess = false;

    pose.onResults((results) => {
      if (!results.poseLandmarks) return;

      const getY = (idx) => results.poseLandmarks[idx]?.y ?? 0;

      // 정자세: 3초 이상 연속 유지시 -> 캡쳐
      if (step === "posture" && !postureSuccess) {
        const isAligned =
          Math.abs(getY(11) - 0.66) < 0.08 &&
          Math.abs(getY(12) - 0.66) < 0.08;

        if (isAligned) {
          if (!postureStartTime) {
            postureStartTime = Date.now(); // 처음 감지된 시간 저장
          } else {

            const elapsed = Date.now() - postureStartTime;
            const seconds = Math.floor(elapsed / 1000);
            console.log(`정자세 유지 중: ${seconds}초`);

            if (elapsed >= 3000) {
              console.log("정자세 3초 유지 성공!");
              sendFrame();
              postureSuccess = true;

              setTimeout(() => {
                console.log("T자 자세로 전환");
                setStep("tpose");
              }, 2000);
            }
          }
        } else {
          if (postureStartTime) {
            console.log("정자세 흐트러짐! 시간 초기화");
          }
          postureStartTime = null;
        }
      }

      // T자 자세: 3초 이상 연속 유지시 -> 캡쳐
      if (step === "tpose" && !tposeSuccess) {
        const isAligned =
          Math.abs(getY(11) - 0.55) < 0.08 &&
          Math.abs(getY(12) - 0.55) < 0.08 &&
          Math.abs(getY(15) - 0.55) < 0.08 &&
          Math.abs(getY(16) - 0.55) < 0.08;

        if (isAligned) {
          if (!tposeStartTime) {
            tposeStartTime = Date.now(); // 처음 감지된 시간 저장
          } else {

            const elapsed = Date.now() - tposeStartTime;
            const seconds = Math.floor(elapsed / 1000);
            console.log(`T자 자세 유지 중: ${seconds}초`);

            if (elapsed >= 3000) {
              console.log("T자 자세 3초 유지 성공!");
              sendFrame();
              tposeSuccess = true;

              setTimeout(() => {
                alert("캘리브레이션 종료");
                navigate("/login");
              }, 2000);
            }
          }
        } else {
          if (tposeStartTime) {
            console.log("T자 자세 흐트러짐! 시간 초기화");
          }
          tposeStartTime = null;
        }

      }
    });


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
          className={`absolute top-0 left-0 w-full h-full rounded-xl transform scale-x-[-1] 
            ${
            isCameraOn
              ? ""
              : "border-2 border-gray-500 rounded-md border-dashed opacity-40"
          }`}
        />
          {!isCameraOn && (
            <div className="absolute top-[250px] left-1/2 -translate-x-1/2 bg-black px-3 py-1 text-[30px] text-gray-500 opacity-40 rounded-xl">
              카메라 접근이 비활성화 되어 있습니다!
            </div>
          )}
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

export default CameraCaliCapture;
