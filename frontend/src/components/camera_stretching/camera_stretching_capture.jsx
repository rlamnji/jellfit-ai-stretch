import { useRef, useEffect, useState } from "react";
import StretchingFeedback from "../stretching/stretching_feedback";
function CameraStretchingCapture({ handleIsCompleted, handleElapsedTime, sendFrameTime , stretchingId}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // canvasRef 초기화
  const streamRef = useRef(null); // 스트림을 저장할 ref

  const [showStart, setShowStart] = useState(true);
  const intervalRef = useRef(null);
  const [message, setMessage] = useState('');
  // const [feedback, setFeedback] = useState('');
  const SHOW_FEEDBACK_TIME = 2000; //N초 이상 피드백 반복되면 피드백 UI에 출력.
  const [repeatedFeedback, setRepeatedFeedback] = useState(null);
  const feedbackDurationRef = useRef(0);
  const prevFeedbackRef = useRef(null);
  
  useEffect(() => {
    // 시작 메시지 먼저 보여줌
    setMessage('시작합니다!');
    setShowStart(true);

    const startTimeout = setTimeout(() => {
      setShowStart(false); // 시작 메시지 숨김
    }, 2000);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(intervalRef.current);
    };
  }, []);

  // 1. 카메라 연결
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
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
          headers:{
            "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
          },
          body: formData,
        });
        if(res.ok){
          const data = await res.json(); // ✅ 실제 응답 JSON 받아오기
          console.log("✅ 서버 응답:", data);
          handleElapsedTime(data.currentSide, data.elapsedTime);
          handleFeedback(data.feedbackMsg, data.feedbackType);
          // 둘다 완료되어야 스트레칭 완료 처리해야함.
          if (data.isCompleted) {
            console.log("스트레칭 완료!!");
            handleIsCompleted(true);
            stopCamera();
          } else {
            console.log("스트레칭 아직 ing");
          }
        }
      } catch (err) {
        console.error("❌ 서버 전송 실패:", err);
      }
    }, "image/jpeg");
  };

  // 3. 일정 간격으로 프레임 전송
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      sendFrame({ stretchingId });
    }, sendFrameTime);
  
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [stretchingId]);
  



  //SHOW_FEEDBACK_TIME 이상 같은 피드백 메세지가 반복되면 화면에 출력.
  const handleFeedback = (feedbackMsg, feedbackType) => {
    if (feedbackType !== 'warning') return;
    const feedbackStr = Array.isArray(feedbackMsg) ? feedbackMsg.join(' / ') : feedbackMsg;
  
    console.log("🟡 새로운 피드백 도착:", feedbackStr);
  
    if (prevFeedbackRef.current === null) {
      console.log("🟢 처음 받은 피드백입니다. 추적 시작:", feedbackStr);
      prevFeedbackRef.current = feedbackStr;
      feedbackDurationRef.current = sendFrameTime;
      return;
    }
  
    if (prevFeedbackRef.current === feedbackStr) {
      feedbackDurationRef.current += sendFrameTime;
      console.log("🔁 같은 피드백 반복 중. 누적 시간:", feedbackDurationRef.current, "ms");
  
      if (feedbackDurationRef.current >= SHOW_FEEDBACK_TIME) {
        console.log("✅ 반복된 피드백이 기준 시간 초과. 출력합니다:", feedbackStr);
        setRepeatedFeedback(feedbackStr);
      }
    } else {
      console.log("🔄 피드백이 바뀌었습니다.");
      console.log("    이전:", prevFeedbackRef.current);
      console.log("    현재:", feedbackStr);
      prevFeedbackRef.current = feedbackStr;
      feedbackDurationRef.current = 0;
      setRepeatedFeedback(null);
    }
  };
    

  // repeatedFeedback이 설정되면 6초 후 null로 자동 초기화
  useEffect(() => {
    if (repeatedFeedback) {
      const timeout = setTimeout(() => {
        setRepeatedFeedback(null);
      }, 6000); // 6초 동안 메시지 보여준 뒤 사라짐

      return () => clearTimeout(timeout); // 메시지가 바뀌거나 컴포넌트 unmount 시 타이머 정리
    }
  }, [repeatedFeedback]);

  //카메라 스트림 정지
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
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full rounded-xl">
        {/* 시작합니다 메시지 - 중앙 */}
        {showStart && (
          <div className="opacity-90 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                          w-[90%] max-w-[800px] h-[100px] md:h-[120px] bg-white text-center 
                          text-xl md:text-3xl lg:text-[48px] font-bold text-[#975D5D] 
                          flex items-center justify-center rounded-3xl shadow-xl z-50 px-4">
            시작합니다!
          </div>
        )}

      <div className="relative w-[66%] h-auto mb-6">
        <video
          ref={videoRef}
          autoPlay
          className="w-full h-auto aspect-video object-contain border rounded-xl transform scale-x-[-1]"
        />

        {/* 👻 서버 전송용 캔버스 (사용자에겐 숨김) */}
        <canvas
          ref={canvasRef} // canvasRef 연결
          width="1200"
          height="720"
          className="hidden w-full h-auto"
        />
        {/*해파리 피드백*/}
        <StretchingFeedback feedbackMsg={repeatedFeedback}/>

      </div>
      {/* ✅ 사용자에게 거울처럼 보이는 비디오 */}

    </div>
  );
}

export default CameraStretchingCapture;