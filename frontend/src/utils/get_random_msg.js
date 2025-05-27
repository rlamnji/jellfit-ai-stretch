export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 시간차로 계속 변경하는 함수
export function startChangingRandomItem(arr, callback, interval = 1000) {
  const timer = setInterval(() => {
    const item = getRandomItem(arr);
    callback(item); // 외부에서 전달된 함수로 결과 전달
  }, interval);

  return () => clearInterval(timer);
}