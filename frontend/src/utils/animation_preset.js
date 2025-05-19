// 홈화면 획득 해파리 렌더링 관련한 애니메이션

// 위치 랜덤 배치
export function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 애니메이션 종류
export const animationPresets = (position) => {
  const floatRange = getRandomFloat(30, 60);
  const rotateRange = getRandomFloat(5, 15);

  return {
    wave: {
      animate: {
        x: [
          position.x,
          position.x + floatRange,
          position.x,
          position.x - floatRange,
          position.x,
        ],
        y: [
          position.y,
          position.y - floatRange,
          position.y,
          position.y + floatRange,
          position.y,
        ],
        rotate: [0, rotateRange, 0, -rotateRange, 0],
      },
    },
    float: {
      animate: {
        y: [
          position.y,
          position.y - floatRange,
          position.y + floatRange,
          position.y,
        ],
      },
    },
    // 필요한 만큼 추가 가능..
  };
};
