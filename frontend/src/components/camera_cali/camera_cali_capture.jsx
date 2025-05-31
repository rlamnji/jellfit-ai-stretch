// 자세 측정
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { isPostureAligned, isTPoseAligned } from "../../utils/pose_check";

function CameraCaliCapture() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const guideCanvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const [step, setStep] = useState("posture");
  const [message, setMessage] = useState(""); // 상태 메시지 표시


  /*const expectedPoseYMap = {
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
  };*/


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
  /*useEffect(() => {
  if (isCameraOn) {
    const timer = setTimeout(() => {
      stopCamera();
      alert("캘리브레이션 종료 (임시 테스트)");
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 정리
  }
}, [isCameraOn]);*/

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
        const y = guideCanvas.height * 0.5;

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

    if (!canvas || !video) {
      console.warn("⛔ canvas 또는 video 요소가 null입니다.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("⛔ canvas 2D context를 가져올 수 없습니다.");
      return;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
      formData.append("pose_type", step);

      try {
        const res = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        console.log("📥 서버 응답:", result);
      } catch (err) {
        console.error("❌ 전송 실패:", err);
      }
    }, "image/jpeg");
  };



  // 여러 프레임 보내는 함수
  const sendMultipleFrames = async (count = 5, interval = 500) => {
    for (let i = 0; i < count; i++) {
      await sendFrame(); // 기존 함수 재사용
      await new Promise((res) => setTimeout(res, interval));
    }
  };

  useEffect(() => {
    // 1. Mediapipe Pose 모델 초기화
    // 2. 정자세 인식 로직
    // 3. T자세 인식 로직
    // 4. 일정 시간 자세 유지되면 -> 프레임 전송 -> 다음 단계로 전환

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

    let postureStableCount = 0;
    let postureSuccess = false;

    let tposeStableCount = 0;
    let tposeSuccess = false;

    pose.onResults( async (results) => {
      if (!results.poseLandmarks) return;

      const landmarks = results.poseLandmarks;

      // ✅ 정자세 인식
      if (step === "posture" && !postureSuccess) {
        if (isPostureAligned(landmarks)) {
          postureStableCount++;
          console.log(`정자세 정렬 프레임 수: ${postureStableCount}`);
          setMessage("정자세 인식을 시작합니다! 다음 안내까지 자세를 유지해주세요!");

          // 정렬프레임 30 넘어가면 화면 찍음
          if (postureStableCount >= 30) {
            postureSuccess = true;
            console.log("✅ 정자세 연속 인식 성공 → 프레임 전송 시작");
            setMessage("✅ 정자세 연속 인식 성공 → 프레임 전송 시작");
            await sendMultipleFrames(5, 500);
            setTimeout(() => {
              console.log("👉 T자세로 전환");
              setMessage("👉 T자세로 전환");
              setStep("tpose");
            }, 2000);
          }
        } else {
          if (postureStableCount > 0) console.log("↩ 정자세 흐트러짐, 카운트 초기화");
          postureStableCount = 0;
        }
      }

      // ✅ T자세 인식
      if (step === "tpose" && !tposeSuccess) {
        if (isTPoseAligned(landmarks)) {
          tposeStableCount++;
          console.log(`T자세 정렬 프레임 수: ${tposeStableCount}`);
          setMessage("T자 자세 인식을 시작합니다! 다음 안내까지 자세를 유지해주세요!");

          if (tposeStableCount >= 30) {
            tposeSuccess = true;
            console.log("✅ T자세 연속 인식 성공 → 프레임 전송 시작");
            setMessage("✅ T자세 연속 인식 성공 → 프레임 전송 시작");
            await sendMultipleFrames(5, 500);
            setTimeout(() => {
              console.log("🎉 캘리브레이션 종료");
              setMessage("캘리브레이션 종료");
              navigate("/login");
            }, 2000);
          }
        } else {
          if (tposeStableCount > 0) console.log("↩ T자세 흐트러짐, 카운트 초기화");
          tposeStableCount = 0;
        }
      }
    });




    let frameCount = 0;
let lastTimestamp = performance.now();

const cam = new Camera(videoRef.current, {
  onFrame: async () => {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTimestamp;

    if (elapsed >= 1000) {
      console.log(`📸 FPS: ${frameCount} frames/sec`);
      frameCount = 0;
      lastTimestamp = now;
    }

    try {
      await pose.send({ image: videoRef.current });
    } catch (err) {
      console.error("❌ pose.send 중 에러:", err);
    }
  },
});

    cam.start();
  }, [step]);

  return (
    <div className="w-full flex flex-col items-center py-4 overflow-y-hidden">
      <div className="relative w-[1200px] h-[675px]">
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
          height="675"
          className="absolute top-0 left-0 z-10 pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          width="1200"
          height="675"
          className="hidden"
        />

      </div>

      <div className="mt-4 text-lg font-semibold text-blue-600">{message}</div>

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
