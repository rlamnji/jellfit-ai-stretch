// 버튼 효과음
import clickSound from '../assets/sounds/click_sound1.mp3';
import { getGlobalToggledSound } from '../context/sound_context';

// 재생/정지를 동일한 오디오 인스턴스에 대해 수행하게 하기 위해 
let audioInstance = null;

// 브금 재생 함수
export const playAudio = (src) => {
    if (!audioInstance) {
        audioInstance = new Audio(src);
        audioInstance.loop = true;
        audioInstance.volume = 0.5;
      }
      audioInstance.play().catch(console.error);
      return audioInstance;
}

// 브금 정지 함수
export const stopAudio = (src) => {
    // 배경음이 꺼졌을 때는 소리 정지
    if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
}


// 클릭 사운드
export const playClickSound = () => {
  if (!getGlobalToggledSound()) return;
  const audio = new Audio(clickSound);
  audio.volume = 0.6;
  audio.play().catch(console.error);
};
  
