// 메인 페이지 화면
// 라이브러리
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';

// 컴포넌트
import ProfileCard from "../components/layout/profile";
import SideWidget from "../components/layout/side_widget";
import DashBoard from "../components/layout/dash_board";
import StartButton from "../components/layout/start_button";
import CharacterGroup from '../components/characters/character_group';
import Test3d from "../components/background_3d/space_scence"

// 사운드
import { playAudio, stopAudio } from '../../common/utils/sound';
import { useSound } from '../../context/sound_context';
import backgroundMusic from '../../assets/sounds/track1.mp3';

import { useUserCharacters }  from '../hooks/user_character';

function HomePage() {

    const {toggledSound, setToggledSound} = useSound(); // 배경음
    const characterUserGetMap = useUserCharacters(); // 캐릭터 훅

    useEffect(()=>{
        // 배경음이 true일 때만 소리재생
        if(toggledSound){
            playAudio(backgroundMusic);
        }else{
            stopAudio();
        }

    },[toggledSound]);
  
  return (
    
    <div className="relative w-screen h-screen overflow-hidden">

      <Canvas className="pointer-events-auto absolute top-0 left-0 w-full h-full z-[-1] bg-[radial-gradient(circle,_#6D83B2,_#221f36)]" camera={{ position: [0,0,-60], fov: 100}}>
        <ambientLight intensity={9} color={"#c3b6d4"} />
          <Test3d />
        </Canvas>

        <div className="relative z-[1] flex flex-col h-full">

          <div className="bg-transparent fixed top-[220px] left-0 z-10">
                <DashBoard /> {/*왼쪽 위젯(친구,도감,일지)*/}
          </div>

          <div className="bg-transparent fixed top-0 left-0 z-10">
              <ProfileCard /> {/*프로필*/}
          </div>

          {/* 사용자 획득 해파리 렌더링 */}
          <div className='bg-transparent fixed top-[220px] left-36 z-10'>
            <CharacterGroup ownedCharacters={characterUserGetMap} />
          </div>
         

          <div className="bg-transparent fixed top-0 right-0 z-30">
            <SideWidget /> {/*사이드바 위젯*/}
          </div>

          <div className="bg-transparent fixed bottom-[20px] right-[20px] z-10">
              <StartButton/> {/*운동시작 버튼*/}
          </div>
          
        </div>

    </div>
  );
}

export default HomePage;
