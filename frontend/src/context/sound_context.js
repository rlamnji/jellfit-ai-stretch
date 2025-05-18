// 전역 상태관리
// 3. 배경음 켜고 껐을 때  on off 상태 ------------ V
// 4. 페이지 마다 사운드 이미지 켜고 껐을 때 on off 상태 ------------ V

import { createContext, useContext, useState } from 'react';

const SoundContext = createContext();

// 클릭음 관련 전역변수
let toggledSoundGlobal = true;

export function SoundProvider({ children }) {

  // 배경음 켰는지 껐는지 관리
  const [toggledSound, setToggledSoundState] = useState(() => {
    // 로컬스토리지 값이 있으면 그걸 사용하고, 없으면 기본값 true
    const saved = localStorage.getItem('toggledSound');
    return saved !== null ? saved === 'true' : true;
  });

  const setToggledSound = (val) => {
    setToggledSoundState(val);
    toggledSoundGlobal = val; // 전역변수도 갱신
    localStorage.setItem('toggledSound', val.toString());
  };

  // 초기에 한 번 세팅
  toggledSoundGlobal = toggledSound;

  // 사운드 이미지 켰는지 껐는지 관리
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <SoundContext.Provider value={{
        toggledSound,
        setToggledSound,
        isPlaying,
        setIsPlaying
    }}>
      {children}
    </SoundContext.Provider>
  );
}

// 외부 사용 ok
export const getGlobalToggledSound = () => toggledSoundGlobal;

export const useSound = () => useContext(SoundContext);