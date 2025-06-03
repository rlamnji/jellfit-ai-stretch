// 자세 측정
import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { isPostureAligned, isTPoseAligned } from "../../utils/cali/pose_check";
import { startCamera, stopCamera } from "../../utils/cali/camera_on_off"; // 카메라 켜고 끄기 관련 함수들
import { drawGuideLines } from "../../utils/cali/draw_guide"; // 가이드 라인 그리기 함수

/* 고쳐야 할 것
  1. 함수 분리해서 관리 --- V
  2. 완료 응답 시 페이지 이동  --- V
  3. 이상치 탐지로 인해 캘브 실패시 다시 측정안내
  4. 완료 응답 내용은 db에 저장할 것 --- V
  5. 관련 ui 확실하게 처리할 것(카메라 크기, 배경 이미지 등)  --- V
  6. 카메라 on off 처리 꼬임 --- V
  7. 각 단계별로 안내 메시지 표시

  서버 응답 예시 :
  {success: false, message: 'tpose 자세가 부적절합니다.', current_pose: 'tpose', collected_frames: 0, target_frames: 30}
  1. 정자세부터 시작해서(current_pose로 판단) collected_frames가 30이 넘어가면 tpose 동작으로
  2. tpose가 collected_frames이 30이 넘어가면 캘리브레이션 완료
  3. setmessage로 현재 상태 메시지 표시 (서버에서 보낸 message)
*/

function CameraCaliCapture() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const guideCanvasRef = useRef(null);
  const location = useLocation();
  const [isCameraOn, setIsCameraOn] = useState(true);

  const [step, setStep] = useState("neutral"); // 현재 단계
  const [message, setMessage] = useState(""); // 상태 메시지 표시
  const [collectedFrames, setCollectedFrames] = useState(0); // 수집된 프레임 수
  const [isCalibrationDone, setIsCalibrationDone] = useState(false); // 캘리브레이션 완료 여부
  const token = sessionStorage.getItem("accessToken");
  let isProcessing = false;

  // 카메라 on off 핸들러
  const handleStopCamera = () => stopCamera(videoRef, guideCanvasRef, setIsCameraOn);
  const handleStartCamera = () => startCamera(videoRef, setIsCameraOn);

  useEffect(() => {
    if (!token) {
      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      navigate("/login");
    }
  }, [token, navigate]);

  // 캘리 완료 → 로그인 이동
  useEffect(() => {
    if (isCalibrationDone) {
      console.log("🎯 useEffect 감지: 캘리 완료 → 로그인 페이지 이동 (3초 대기)");

      // 3초 후 이동
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 3000); 

      return () => clearTimeout(timeout); 
    }
  }, [isCalibrationDone]);

  // ✅ 페이지 진입 시 초기화 (pathname만 감지)
  useEffect(() => {
    setIsCalibrationDone(false); // 초기화 확실히
    setStep("neutral");
    setCollectedFrames(0);
    setMessage("정자세 측정을 시작합니다.");
  }, [location.pathname]);

  // 가이드선 그리기
  useEffect(() => {
    const canvas = guideCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGuideLines(step, ctx, canvas, isCameraOn);
  }, [step, isCameraOn]);


  // 프레임 전송 함수
  // poseType: "neutral" 또는 "tpose"로 구분
  // setStep("done") 면 캘리 완료로 간주
  const sendFrame = (poseType) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!isCameraOn || isCalibrationDone || step === "done") return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      if (!canvas || !video) {
        return resolve(null);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("⛔ canvas context가 없습니다.");
        return resolve(null);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(null);

        if (!isCameraOn || isCalibrationDone || step === "done") {
          console.warn("⛔ 카메라 꺼짐 또는 캘리 완료 → 전송 생략");
          return resolve(null);
        }


        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");
        formData.append("pose_type", poseType);

        try {
          const res = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: formData,
          });

          const result = await res.json();

          if (step !== "done") {
            setStep(result.current_pose);
          }
          setMessage(result.message);
          setCollectedFrames(result.collected_frames || 0); // 수집된 프레임 수 업데이트

          console.log("📥 서버 응답:", result);
          resolve(result);

          // 캘리브레이션 완료 조건
          if(result.success === true && result.collected_frames >= result.target_frames) {
            console.log("🎉 캘리브레이션 완료");
            setMessage("캘리브레이션이 완료되었습니다! 로그인 페이지로 이동합니다.");
            handleStopCamera();
            setIsCalibrationDone(true);
            setStep("done");
            
          }

          // 이상치 탐지 실패 로직 추가 예정

        } catch (err) {
          console.error("❌ 전송 실패:", err);
          reject(err);
        }
      }, "image/jpeg");
    });
  };

  // 여러 프레임 보내는 함수
  const sendMultipleFrames = async (count = 5, interval = 300, poseType = "neutral") => {
    if (isCalibrationDone || !isCameraOn || step === "done") return null;


    const framePromises = [];

    for (let i = 0; i < count; i++) {
      framePromises.push(sendFrame(poseType));
      await new Promise((res) => setTimeout(res, interval)); // 인터벌 유지
    }

    const results = await Promise.all(framePromises);

    // 유효한 결과만 필터
    const validResults = results.filter((res) => res?.success);
    const lastValid = validResults[validResults.length - 1];

    return lastValid || null;

    
  };

  useEffect(() => {
    // 1. Mediapipe Pose 모델 초기화
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
      if (!results.poseLandmarks || step === "" || step === "done" || isCalibrationDone) return;

      const landmarks = results.poseLandmarks;

      // 2. 정자세 인식
      if (step === "neutral" && !postureSuccess) {
        if (isPostureAligned(landmarks)) { // 프론트에서도 조건 검사를 함
          postureStableCount++;
          console.log(`정자세 정렬 프레임 수: ${postureStableCount}`);
          setMessage("정자세 인식을 시작합니다! 다음 안내까지 자세를 유지해주세요!"); // 준비자세 느낌

          // 정렬프레임 20 넘어가면 서버요청 시작
          if (postureStableCount >= 20) {
            postureSuccess = true;
            console.log("✅ 정자세 연속 인식 성공 → 프레임 전송 시작");
            setMessage("🙆‍♀️ 정자세 인식 완료! 측정을 진행할게요.");
              let collected = 0;
              let result;
              while (collected < 30) {
                result = await sendMultipleFrames(10, 300, "neutral");
                collected = result?.collected_frames || 0;
              }
          }
        } else {
          if (postureStableCount > 0) console.log("↩ 정자세 흐트러짐, 카운트 초기화");
          postureStableCount = 0;
        }
      }

      // 3. T자세 인식
      if (step === "tpose" && !tposeSuccess) {
        if (isTPoseAligned(landmarks)) {
          tposeStableCount++;
          console.log(`T자세 정렬 프레임 수: ${tposeStableCount}`);
          setMessage("T자 자세 인식을 시작합니다! 다음 안내까지 자세를 유지해주세요!");

          if (tposeStableCount >= 20) {
            tposeSuccess = true;
            console.log("✅ T자세 연속 인식 성공 → 프레임 전송 시작");
            setMessage("🙆‍♀️ T자세 인식 완료! 측정을 진행할게요.");

            let collected = 0;
            let result;

            while (collected < 30) {
              result = await sendMultipleFrames(10, 300, "tpose");
              if (!result) break;

              setMessage(result.message);
              setCollectedFrames(result.collected_frames || 0);
              collected = result.collected_frames || 0;

              if (!result || result.success === false) {
                console.warn("📛 실패 또는 응답 없음 → 캘리 초기화");
                setMessage("캘리브레이션 실패 → 다시 측정을 시작합니다.");
                setStep("neutral");

                // 상태 초기화
                postureStableCount = 0;
                postureSuccess = false;
                tposeStableCount = 0;
                tposeSuccess = false;
                return;
              }

              setMessage(result.message);
              setCollectedFrames(result.collected_frames || 0);
              collected = result.collected_frames || 0;

            }

            console.log("반복문 탈출");
          }
        } else {
          if (tposeStableCount > 0) console.log("↩ T자세 흐트러짐, 카운트 초기화");
          tposeStableCount = 0;
        }
      }

    });


    const cam = new Camera(videoRef.current, {
      onFrame: async () => {
        const video = videoRef.current;

        if (!video || !video.srcObject || !video.srcObject.active) return;
        if (isProcessing || step === "done" || isCalibrationDone) return;

        isProcessing = true;

        try {
          await pose.send({ image: video });
        } catch (e) {
          console.error("❌ pose.send 중 에러:", e);
        }

        isProcessing = false;
      },
    });

    cam.start();

    return () => {
      cam.stop();
      pose.reset?.();
      console.log("📴 컴포넌트 언마운트 → pose 중단 및 cam 정지");
    };
  }, [step]);



  return (
    <div className="w-full flex flex-col items-center py-4 overflow-y-hidden relative">
      <div className="relative w-full max-w-[1500px] h-full max-h-[600px] aspect-[16/9]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`absolute top-0 left-0 w-full h-full rounded-xl transform scale-x-[-1] object-cover ${
            isCameraOn
              ? ""
              : "border-2 border-gray-500 rounded-md border-dashed opacity-40"
          }`}
        />
          {!isCameraOn && (
            <div className="absolute top-[250px] left-1/2 -translate-x-1/2 bg-black px-3 py-1 text-[25px] text-white opacity-40 rounded-xl">
              카메라 접근이 비활성화 되어 있습니다!
            </div>
          )}
        <canvas
          ref={guideCanvasRef}
          className="absolute top-1/3 left-0 w-full h-[50%] z-10 pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        <div className="absolute top-3 left-3 w-[12%] h-[10%] z-10 pointer-events-none bg-[#353535] p-2 flex items-center text-center justify-center rounded-full text-white text-[1.5vw]">{collectedFrames} / 30</div>

        {/* 안내 메시지 표시 */}
        {isCameraOn &&(
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-85 rounded-3xl w-[80%] mt-4 font-semibold text-white text-[28px] bg-[#2c1e1e] p-2  text-center">{message}</div>
        )}

      </div>

      <div className="flex flex-row justify-around gap-4">
        <button
          onClick={ isCameraOn ? handleStopCamera : handleStartCamera}
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