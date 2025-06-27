import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import volumeOn from '../../assets/images/icons/volume_max.png';
import volumeOff from '../../assets/images/icons/volume_x.png';
import backgroundMusic from '../../assets/sounds/track1.mp3';
import loginMusic from '../../assets/sounds/startTrack.mp3';

import { useSound } from '../../context/sound_context';
import { playAudio, stopAudio } from '../../utils/sound';
//ON! 로그인 페이지 외의 페이지 갈때 소리가 안바뀜.
function SoundBtn() {
  const { isPlaying, setIsPlaying } = useSound();
  const [music, setMusic] = useState(null);
  const location = useLocation();

  // 경로 바뀔 때 음악도 바꾸기
  useEffect(() => {
    console.log('현재 경로:', location.pathname);

    const path = location.pathname;
    if (path === '/' || path === '/login' || path === '/join') {
      console.log('로그인 페이지로 이동');
      setMusic(loginMusic);
    } else { 
      console.log('다른 페이지로 이동'); 
      setMusic(backgroundMusic);
    }
  }, [location.pathname]);

  // 저장된 사운드 상태 불러오기
  useEffect(() => {
    const savedSound = localStorage.getItem('isPlaying');
    if (savedSound !== null) {
      setIsPlaying(savedSound === 'true');
    }
  }, []);

  const handleToggle = () => {
    setIsPlaying(prev => !prev);
  };

  // music이 바뀌었을 때 음악을 새로 적용
  useEffect(() => {
    console.log('음악이 바뀜:', music);
    if (!isPlaying && music) {
      playAudio(music); // ✅ 바뀐 음악으로 즉시 재생
    }
  }, [music]);

  // 소리 on/off 상태가 바뀌었을 때
  useEffect(() => {
    console.log('사운드 상태 변경:', isPlaying);
    localStorage.setItem('isPlaying', isPlaying.toString());
    if (!isPlaying && music) {
      playAudio(music); // ✅ 꺼져있던 걸 다시 킴
    } else {
      stopAudio(); // ❗소리 끔
    }
  }, [isPlaying]);

  return (
    <div className="w-8 h-8 m-4">
      <button onClick={handleToggle}>
        <img src={isPlaying ? volumeOff : volumeOn} alt="사운드버튼" />
      </button>
    </div>
  );
}

export default SoundBtn;
