// 가이드 모드 스트레칭 시간 누적
// self_stretch_page.jsx에 있을 때만 측정

let accumulatedMs = 0;
let activeStartTime = null;

export function startOrResumeSession() {
  if (!activeStartTime) {
    activeStartTime = new Date();
    console.log("세션시작:", activeStartTime.toISOString());
  }
}

// 다른 페이지로 이동할 때 잠시 일시정지
export function pauseSession() {
  if (activeStartTime) {
    const now = new Date();
    const sessionMs = now - activeStartTime;
    accumulatedMs += sessionMs;
    console.log("일시정지:", now.toISOString(), "누적:", Math.floor(accumulatedMs / 1000), "초");
    activeStartTime = null;
  }
}

export function endSession() {
  pauseSession(); // 현재 켜져있으면 멈추기
  const totalSeconds = Math.floor(accumulatedMs / 1000);
  console.log("세션 종료, 총 시간:", totalSeconds, "초");

  const result = {
    duration: totalSeconds,
    endedAt: new Date().toISOString()
  };

  // 초기화
  accumulatedMs = 0;
  activeStartTime = null;

  return result;
}