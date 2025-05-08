// 전역 상태관리
// 3. 배경음 켜고 껐을 때  on off 상태 ------------ V
// 4. 페이지 마다 사운드 이미지 켜고 껐을 때 on off 상태

import { createContext, useContext, useState } from 'react';

const SoundContext = createContext();

export function SoundProvider({ children }) {

  // 배경음 켰는지 껐는지 관리
  const [toggledSound, setToggledSound] = useState(false);

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

export const useSound = () => useContext(SoundContext);