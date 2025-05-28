import { useRef, useEffect, useState, use } from "react";
import PostureToolbar from "./posture_toolbar";

function CameraPostureCapture({ sendFrameTime }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const centerGuideCanvasRef = useRef(null);
  const intervalRef = useRef(null); // interval ID 저장용

  const prevPostureCodeRef = useRef(null);
  const goodPostureDurationRef = useRef(0);
  const hasAlertedRef = useRef(false);

  const intervalSec = sendFrameTime / 1000; // 0.3초
  const bad = 2;
  const good = 1;
  const unknown = 0;
  const BAD_POSTURE_DURATION_LIMIT = 10; // 10초 이상 지속 시 알림
  const MIN_BAD_POSTURE_DURATION = 3;     // 나쁜 자세 진입 조건
  const MIN_GOOD_POSTURE_DURATION = 5;    // 나쁜 자세 리셋 조건 (= 좋은 자세 일정 시간 유지)

  const [goodPostureDuration, setGoodPostureDuration] = useState(0);
  const [badPostureDuration, setBadPostureDuration] = useState(0); // 총 나쁜 자세 시간(BAD_POSTURE_DURATION_LIMIT넘으면 리셋)
  const [inBadPosture, setInBadPosture] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);

  const [currentPosture, setCurrentPosture] = useState(0);

  const [isCameraOn, setIsCameraOn] = useState(true);
  
  

  // 카메라 연결
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      })
      .catch((err) => {
        console.error("❌ 카메라 연결 실패:", err);
        setIsCameraOn(false);
      });

    return () => {
      stopCamera();
    };
  }, []);

  // 프레임 캡처 및 자세 판단 요청
  const sendFrame = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 좌우 반전 해제
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {

        const res = await fetch("http://localhost:8000/posture/predict", {
          method: "POST",
          body: formData,
        });
      
        if (res.ok) {
          const { postureCode } = await res.json(); // 0: unknown, 1: good, 2: bad

          const prevCode = prevPostureCodeRef.current; //test
          

          if (postureCode === bad) {
            if (prevCode === bad) {
              console.log("🟥 bad → bad 진입");
              setBadPostureDuration((prev) => prev + intervalSec);
            } else if (prevCode === good) {
              console.log("🟨 good → bad 진입");
              const estimatedGoodDuration = goodPostureDurationRef.current; // 이거 변수 필요없나 한번 확인해보기

              console.log("⏱️ estimatedGoodDuration(기존 상태 기반):", estimatedGoodDuration);
        
              if (estimatedGoodDuration >= MIN_GOOD_POSTURE_DURATION) {
                console.log("🟢 조건 충족: estimatedGoodDuration >= MIN_GOOD_POSTURE_DURATION");
                setInBadPosture(false); // 나쁜 자세 모드 종료
                setBadPostureDuration(0);
                setGoodPostureDuration(0);
                console.log("🟢 나쁜 자세 모드 종료");
                console.log("🟢 나쁜 자세 카운트 리셋");
                console.log("🟢 좋은 자세 카운트 리셋");
              } else {
                // 이때 bad가 9초대일 경우 good 초 세느라 10초가 지나서 알림을 받을 수 있다.
                // 하지만 그래봤자 몇초(지금은 5초) 차이여서 그정도 늦게 알림을 받는 것은 넘어가도록 하자.
                console.log("🟧 조건 미충족: estimatedGoodDuration < MIN_GOOD_POSTURE_DURATION");
                setBadPostureDuration((prev) => prev + estimatedGoodDuration);
                setGoodPostureDuration(0);
              }
            }
          } else if (postureCode === good) {
            console.log("🟩 good posture 진입");
            setGoodPostureDuration(prev => {
              const newVal = prev + intervalSec;
              goodPostureDurationRef.current = newVal; 
              return newVal;
            });
          }
        
          prevPostureCodeRef.current = postureCode;
        }

      } catch (err) {
        console.error("❌ 서버 전송 실패:", err);
      }
    }, "image/jpeg");
  };

  // 나쁜 자세 타이머
  useEffect(() => {
    console.log("badPostureDuration", badPostureDuration);
  
    // 나쁜 자세 모드 진입
    if (badPostureDuration >= MIN_BAD_POSTURE_DURATION) {
      setInBadPosture(true);
    }
  
    // ✅ 알림 조건: BAD_POSTURE_DURATION_LIMIT 이상 + 아직 알림 안 울림
    if (
      inBadPosture &&
      badPostureDuration >= BAD_POSTURE_DURATION_LIMIT &&
      !hasAlertedRef.current
    ) {
      hasAlertedRef.current = true;
      console.log("🔔 나쁜 자세 알림 조건 충족");
  
      window.api?.notify?.(
        "자세 알림",
        "⚠️ 나쁜 자세가 10초 이상 지속되고 있어요!"
      );
    }
  }, [badPostureDuration, inBadPosture]);

  // 알림 상태 초기화 함수
  // 좋은 자세 MIN_GOOD_POSTURE_DURATION(초) 유지하면 나쁜 자세 모드 해제되면서 알림 상태 초기화.
  useEffect(() => {
    if (!inBadPosture) {
      hasAlertedRef.current = false; // 알림 다시 가능하도록 리셋
    }
  }, [inBadPosture]);
  

  // 좋은 자세 타이머
  useEffect(() => {
    console.log("goodPostureDuration", goodPostureDuration);
  }, [goodPostureDuration]);


  // 프레임 주기 전송 타이머
  useEffect(() => {
    intervalRef.current = setInterval(sendFrame, sendFrameTime);
    return () => clearInterval(intervalRef.current);
  }, [sendFrameTime]);
  
  // 종료 버튼 클릭 핸들러
  const handleOnExitClick = () => {
    stopCamera();
    window.close();
  }

  // 카메라 끄기 함수
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      console.log("✅ 카메라 스트림 정지됨");
    }
  
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("🛑 프레임 전송 중단됨");
    }
    
    setIsCameraOn(false);
  };

  
  // 카메라 켜기 함수
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
  
      // ✅ 카메라 상태 설정
      setIsCameraOn(true);
      console.log("📷 카메라 켜짐");
  
      // ✅ 프레임 전송 시작 (이전에 멈췄다면 다시 시작)
      if (!intervalRef.current) {
        intervalRef.current = setInterval(sendFrame, sendFrameTime);
        console.log("📤 프레임 전송 시작됨");
      }
    } catch (err) {
      console.error("❌ 카메라 켜기 실패:", err);
    }
  };

  // useEffect(() => {
  //   const video = videoRef.current;
  //   const canvas = centerGuideCanvasRef.current;
  
  //   if (!video || !canvas) return;
  
  //   const drawCrosshair = () => {
  //     // 십자가캔버스를 비디오 크기에 맞추기
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  
  //     const ctx = canvas.getContext("2d");
  //     const w = canvas.width;
  //     const h = canvas.height;
  
  //     ctx.clearRect(0, 0, w, h);
  
  //     ctx.strokeStyle = "red";
  //     ctx.lineWidth = 2;
  
  //     // 십자가 그리기
  //     ctx.beginPath();
  //     ctx.moveTo(w / 2, h / 2 - 20);
  //     ctx.lineTo(w / 2, h / 2 + 20);
  //     ctx.stroke();
  
  //     ctx.beginPath();
  //     ctx.moveTo(w / 2 - 20, h / 2);
  //     ctx.lineTo(w / 2 + 20, h / 2);
  //     ctx.stroke();
  //   };
  
  //   video.addEventListener("loadedmetadata", drawCrosshair);
  
  //   return () => {
  //     video.removeEventListener("loadedmetadata", drawCrosshair);
  //   };
  // }, []);
  useEffect(() => {
    const drawCrosshair = () => {
      const canvas = centerGuideCanvasRef.current;
      const video = videoRef.current;
  
      if (!canvas || !video) return;
  
      // ✅ 비디오가 실제로 보여지는 크기 기준으로 캔버스 크기 설정
      const w = video.clientWidth;
      const h = video.clientHeight;
  
      canvas.width = w;
      canvas.height = h;
  
      const ctx = canvas.getContext("2d");
  
      // 캔버스 초기화
      ctx.clearRect(0, 0, w, h);
  
      // 십자선 스타일
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
  
      // 세로선
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2 - 20);
      ctx.lineTo(w / 2, h / 2 + 20);
      ctx.stroke();
  
      // 가로선
      ctx.beginPath();
      ctx.moveTo(w / 2 - 20, h / 2);
      ctx.lineTo(w / 2 + 20, h / 2);
      ctx.stroke();
    };
  
    const handleResize = () => {
      drawCrosshair(); // 창 크기 변경 시 다시 그리기
    };
  
    const video = videoRef.current;
  
    if (video) {
      video.addEventListener("loadedmetadata", drawCrosshair);
    }
  
    window.addEventListener("resize", handleResize);
  
    return () => {
      if (video) {
        video.removeEventListener("loadedmetadata", drawCrosshair);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  

  
  
  

  return (
    <div className="relative w-full h-screen flex flex-col items-center py-4">
      <video
        ref={videoRef}
        autoPlay
        className="absolute top-0 left-0 transform scale-x-[-1]"
      />
      <canvas
        ref = {centerGuideCanvasRef}
        className="absolute top-0 left-0 pointer-events-none"
      />

      {/* 하단 툴바 (종료, 메인, 카메라 종료) */}
      <PostureToolbar
        onExit={handleOnExitClick}
        onStopCamera={stopCamera}
        onStartCamera={startCamera}
        isCameraOn = {isCameraOn}
      />

      {/* 👻 서버 전송용 캔버스 (숨김 처리) */}
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        className="hidden"
      />
    </div>
  );
}

export default CameraPostureCapture;