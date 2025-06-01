// 가이드 라인 그리기 함수

export function drawGuideLines(step, ctx, canvas, isCameraOn) {
  if (!ctx || !canvas || !isCameraOn) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 4;

  const centerX = canvas.width / 2;

  if (step === "tpose") {
    ctx.strokeStyle = "rgba(255, 165, 0, 0.5)";
    const y = canvas.height * 0.55;

    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.1, y);
    ctx.lineTo(canvas.width * 0.9, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, y - 100);
    ctx.lineTo(centerX, y + 120);
    ctx.stroke();
  }

  if (step === "posture" || step === "neutral") {
    ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
    const y = canvas.height * 0.5;

    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.4, y);
    ctx.lineTo(canvas.width * 0.6, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, y - 80);
    ctx.lineTo(centerX, y + 100);
    ctx.stroke();
  }
}
