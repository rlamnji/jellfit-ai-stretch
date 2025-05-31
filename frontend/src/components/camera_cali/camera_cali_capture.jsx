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

  const token = sessionStorage.getItem("accessToken");

  const postureStableCount = useRef(0);
  const tposeStableCount = useRef(0);
  const successFlags = useRef({ posture: false, tpose: false });


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

  // 📌 프레임 전송
  const sendFrame = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;

    const ctx = canvas.getContext("2d");
    ctx?.setTransform(1, 0, 0, 1, 0, 0);
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(null);

        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");
        formData.append("pose_type", step);

        try {
          const res = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: { Authorization: "Bearer " + token },
            body: formData,
          });

          const result = await res.json();
          console.log("📥 서버 응답:", result);
          resolve(result);
        } catch (err) {
          console.error("❌ 전송 실패:", err);
          resolve(null);
        }
      }, "image/jpeg");
    });
  };

  // 📌 목표 프레임 수 도달할 때까지 반복 전송
  const sendUntilCollected = async (target = 30, interval = 300) => {
    let collected = 0;
    let result = null;

        if (result?.current_pose) {
      console.log("📍 current_pose:", result.current_pose);
    }

    while (collected < target) {
      result = await sendFrame();
      if (result?.collected_frames !== undefined) {
        collected = result.collected_frames;
        console.log(`✅ 누적 유효 프레임 수: ${collected}/${target}`);
      } else {
        console.warn("⚠️ 응답에 collected_frames 없음 또는 실패");
      }
      await new Promise((r) => setTimeout(r, interval));
    }

    return result;
  };

  // 📌 Mediapipe Pose 세팅
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

    pose.onResults(async (results) => {
      if (!results.poseLandmarks) return;
      const landmarks = results.poseLandmarks;

      if (step === "posture" && !successFlags.current.posture) {
        if (isPostureAligned(landmarks)) {
          postureStableCount.current++;
          setMessage("정자세 인식을 시작합니다! 다음 안내까지 자세를 유지해주세요!");

          if (postureStableCount.current >= 30) {
            successFlags.current.posture = true;
            const result = await sendUntilCollected(30, 300);

            if (result?.message) setMessage(result.message);
            if (result?.current_pose) setStep(result.current_pose); // 💡 백 기준으로 다음 단계
          }
        } else {
          postureStableCount.current = 0;
        }
      }

      if (step === "tpose" && !successFlags.current.tpose) {
        if (isTPoseAligned(landmarks)) {
          tposeStableCount.current++;
          setMessage("T자 자세 인식을 시작합니다! 다음 안내까지 자세를 유지해주세요!");

          if (tposeStableCount.current >= 30) {
            successFlags.current.tpose = true;
            const result = await sendUntilCollected(30, 500);

            if (result?.message) setMessage(result.message);

            if (result?.current_pose === "done") {
              setMessage("🎉 캘리브레이션 종료");
              setTimeout(() => navigate("/login"), 2000);
            } else {
              setStep(result.current_pose); // 혹시 다른 단계가 있으면
            }
          }
        } else {
          tposeStableCount.current = 0;
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
          console.log(`FPS: ${frameCount} frames/sec`);
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


    // 📌 가이드선 그리기
  useEffect(() => {
    const guideCanvas = guideCanvasRef.current;
    const ctx = guideCanvas?.getContext("2d");
    if (!guideCanvas || !ctx) return;

    let animationFrameId;

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

      animationFrameId = requestAnimationFrame(drawGuide);
    };

    drawGuide();

    return () => cancelAnimationFrame(animationFrameId);
  }, [step, isCameraOn]);


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
          width="640"
          height="360"
          style={{ width: "1200px", height: "675px" }}
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
