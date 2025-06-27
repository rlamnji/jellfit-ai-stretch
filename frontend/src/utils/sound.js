// 버튼 효과음
import clickSound from '../assets/sounds/click_sound1.mp3';
import { getGlobalToggledSound } from '../context/sound_context';

// 재생/정지를 동일한 오디오 인스턴스에 대해 수행하게 하기 위해 
let audioInstance = null;

// 브금 재생 함수
export const playAudio = (src) => {
  const absoluteSrc = new URL(src, window.location.href).href;

  // 브라우저 전역에 저장
  if (!window.audioInstance) {
    window.audioInstance = new Audio(absoluteSrc);
    window.audioInstance.loop = true;
    window.audioInstance.volume = 0.5;
    window.audioInstance.play().catch(console.error);
    return window.audioInstance;
  }

  // 이미 같은 음악이 재생 중이라면 그대로 둠
  if (window.audioInstance.src === absoluteSrc) {
    if (window.audioInstance.paused) {
      window.audioInstance.play().catch(console.error);
    }
    return window.audioInstance;
  }

  // 다른 음악이면 멈추고 새로
  window.audioInstance.pause();
  window.audioInstance.currentTime = 0;

  window.audioInstance = new Audio(absoluteSrc);
  window.audioInstance.loop = true;
  window.audioInstance.volume = 0.5;
  window.audioInstance.play().catch(console.error);

  return window.audioInstance;
};

// 브금 정지 함수
export const stopAudio = () => {
  if (window.audioInstance) {
    window.audioInstance.pause();
    window.audioInstance.currentTime = 0;
  }
};


// 클릭 사운드
export const playClickSound = () => {
  if (!getGlobalToggledSound()) return;
  const audio = new Audio(clickSound);
  audio.volume = 0.6;
  audio.play().catch(console.error);
};
  
