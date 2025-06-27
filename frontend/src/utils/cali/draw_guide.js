// 가이드 라인 그리기 함수
export function drawGuideLines(step, ctx, canvas, isCameraOn) {
  if (!ctx || !canvas || !isCameraOn) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 4;

  // 중앙선을 살짝 왼쪽으로 (정렬 가이드)
  const centerX = canvas.width * 0.48;

  if (step === "tpose") {
    ctx.strokeStyle = "rgba(255, 165, 0, 0.5)";
    const centerY = canvas.height * 0.4; // 약간 위쪽 기준: 팔 수평선

    // 가로선 (팔의 수평 정렬)
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.1, centerY - 5);
    ctx.lineTo(canvas.width * 0.9, centerY - 5);
    ctx.stroke();

    // 세로선 (몸통 중심)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 120);
    ctx.lineTo(centerX, centerY + 120);
    ctx.stroke();
  }

  if (step === "posture" || step === "neutral") {
    ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
    const centerY = canvas.height * 0.48;
    const lineWidth = canvas.width * 0.2; // 턱 위치

    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.28, centerY);   // ⬅ 가로선 y 좌표도 centerY로 통일!
    ctx.lineTo(canvas.width * 0.7, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX , centerY - 100); // 세로선 중심이 centerY
    ctx.lineTo(centerX , centerY + 100);
    ctx.stroke();
  }
}
