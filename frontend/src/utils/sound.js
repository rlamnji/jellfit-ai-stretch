// 브금 재생 함수
import clickSound from '../assets/sounds/click_sound1.mp3';

export const playBackgroundMusic = (src) => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(console.error);
    return audio;
}

// 클릭 사운드
export const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.play();
};
  
