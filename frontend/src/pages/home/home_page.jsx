// 메인 페이지 화면
// tailwind css 사용
import ProfileCard from "../../components/home/profile";
import SideWidget from "../../components/home/menu/side_widget";
import DashBoard from "../../components/home/menu/dash_board";
import StartButton from "../../components/home/start_button";

import { Canvas } from '@react-three/fiber';
import Test3d from "../../components/home/background_3d/space_scence"


function HomePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
        <Canvas className="pointer-events-auto absolute top-0 left-0 w-full h-full z-[-1] bg-[radial-gradient(circle,_#6D83B2,_#221f36)]" camera={{ position: [0,0,-60], fov: 100}}>
        <ambientLight intensity={9} color={"#c3b6d4"} />
          <Test3d />
        </Canvas>

        <div className="relative z-[1] flex flex-col h-full">
          <div className="bg-transparent fixed top-0 left-0 z-10">
              <ProfileCard /> {/*프로필*/}
          </div>

          <div className="bg-transparent fixed top-0 right-0 z-10">
            <SideWidget /> {/*사이드바 위젯*/}
          </div>
          
          <div className="bg-transparent fixed top-[220px] left-0 z-10">
              <DashBoard /> {/*왼쪽 위젯(친구,도감,일지)*/}
          </div>

          <div className="bg-transparent fixed bottom-[20px] right-[20px] z-10">
            <StartButton/> {/*운동시작 버튼*/}
          </div>
        </div>




    </div>
  );
}

export default HomePage;
