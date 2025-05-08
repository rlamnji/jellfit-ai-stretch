// 백그라운드 스트레칭 알림 함수
let timer = null;

export function startReminder(delay) {
    if (!delay || typeof delay !== 'number') return;
  
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          console.log('알림 권한:', permission);
        });
      }
  
    timer = setInterval(() => {
      if (Notification.permission === "granted") {
        new Notification("알림", {
          body: "스트레칭 할 시간이 되었습니다!",
        });
      } else {
        alert("설정한 시간이 지났습니다!");
      }
    }, delay);
  
    return timer;
}

export function stopRepeatingReminder() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
}
  