export const getDistance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

// 정자세 조건
export const isPostureAligned = (landmarks) => {
  const getX = (idx) => landmarks[idx]?.x ?? 0;
  const getY = (idx) => landmarks[idx]?.y ?? 0;

  const lShoulderX = getX(11);
  const rShoulderX = getX(12);
  const lShoulderY = getY(11);
  const rShoulderY = getY(12);
  const noseX = getX(0);
  const noseY = getY(0);
  const lElbowY = getY(13);
  const rElbowY = getY(14);
  const lWristY = getY(15);
  const rWristY = getY(16);

  const shoulderMidX = (lShoulderX + rShoulderX) / 2;
  const shoulderAvgY = (lShoulderY + rShoulderY) / 2;

  const isShoulderLevel = Math.abs(lShoulderY - rShoulderY) < 0.02; // 좌우 어깨의 y좌표 차이가 2% 이내인지 
  const isShoulderNotLifted = lShoulderY > 0.4 && rShoulderY > 0.4; // 어깨가 너무 위로 들려 있지 않은가 , y값이 작아질수록 위로 감
  const isNoseCentered = Math.abs(noseX - shoulderMidX) < 0.015; // 코가 양 어깨의 x중심선에서 ±1.5% 이내인지 , 얼굴이 중앙을 정확히 보고 있는가
  const isShoulderSymmetric = Math.abs(lShoulderX - rShoulderX) > 0.28; // 좌우 어깨 간 x좌표 간격이 충분한가 ,어깨를 오므리지 않았는지 확인
  const isHeadNotForward = noseY < shoulderAvgY - 0.08; // 고개가 앞으로 쏠려 있지 않은가
  const isNoseNotTooLow = noseY < 0.6; // 고개를 숙였는지
  const isBodyCentered = Math.abs(shoulderMidX - 0.5) < 0.03; // 몸이 중간에 있냐?
  const isHandNotVisible = lWristY > 1 && rWristY > 1; // 손이 나오면 탈락락

  const isArmsDown =
    lElbowY > lShoulderY &&
    rElbowY > rShoulderY &&
    lWristY > lShoulderY &&
    rWristY > rShoulderY;

  // 디버깅 로그
  if (!isShoulderLevel) console.log("어깨 수평 아님");
  if (!isNoseCentered) console.log("코가 어깨 중심선에서 벗어남");
  if (!isShoulderSymmetric) console.log("어깨 간격이 너무 좁음");
  if (!isShoulderNotLifted) console.log("양쪽 어깨가 너무 위로 올라감");
  if (!isHeadNotForward) console.log("고개가 앞으로 숙여짐");
  if (!isNoseNotTooLow) console.log("코가 화면 아래로 너무 내려옴");
  if (!isBodyCentered) console.log("몸이 화면 중앙에서 벗어남");
  if (!isArmsDown) console.log("팔이 차렷 상태가 아님 (팔 올려짐)");
  if (!isHandNotVisible) console.log("손 나옴");

  return (
    isShoulderLevel &&
    isNoseCentered &&
    isShoulderSymmetric &&
    isShoulderNotLifted &&
    isHeadNotForward &&
    isNoseNotTooLow &&
    isBodyCentered &&
    isArmsDown &&
    isHandNotVisible
  );
};


// T자 자세
export const isTPoseAligned = (landmarks) => {
  const getX = (idx) => landmarks[idx]?.x ?? 0;
  const getY = (idx) => landmarks[idx]?.y ?? 0;

  const noseX = getX(0);

  const lShoulderX = getX(11);
  const rShoulderX = getX(12);
  const lShoulderY = getY(11);
  const rShoulderY = getY(12);

  const lElbowY = getY(13);
  const rElbowY = getY(14);

  const shoulderMidX = (lShoulderX + rShoulderX) / 2;
  const shoulderAvgY = (lShoulderY + rShoulderY) / 2;
  const elbowAvgY = (lElbowY + rElbowY) / 2;

  // 💡 완화된 조건들
  const isBodyCentered = Math.abs(shoulderMidX - 0.5) < 0.07; // 화면 중심에서 벗어나지 않음
  const isShoulderLevel = Math.abs(lShoulderY - rShoulderY) < 0.05; // 좌우 어깨 높이 비슷
  const isElbowLevel = Math.abs(lElbowY - rElbowY) < 0.06; // 좌우 팔꿈치 높이 비슷
  const isArmHorizontal = Math.abs(shoulderAvgY - elbowAvgY) < 0.07; // 팔꿈치가 어깨랑 비슷한 높이
  const isNoseCentered = Math.abs(noseX - shoulderMidX) < 0.04; // 얼굴이 기울어지지 않음

  // 🧪 디버깅 로그
  if (!isBodyCentered) console.log("❌ 몸통이 화면 중앙에서 벗어남");
  if (!isShoulderLevel) console.log("❌ 어깨 수평 아님");
  if (!isElbowLevel) console.log("❌ 팔꿈치 수평 아님");
  if (!isArmHorizontal) console.log("❌ 어깨와 팔의 높이 차이 큼");
  if (!isNoseCentered) console.log("❌ 코가 어깨 중심선에서 벗어남 (고개 기울어짐)");

  return (
    isBodyCentered &&
    isShoulderLevel &&
    isElbowLevel &&
    isArmHorizontal &&
    isNoseCentered
  );
};
