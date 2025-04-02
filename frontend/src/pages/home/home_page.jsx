// 메인 페이지 화면
import ProfileCard from "../home/__components/profile";
import SideWidget from "../../components/menu/side_widget";
import styles from "./home_page.module.css";
import DashBoard from "../home/__components/dash_board";
import StartButton from "../home/__components/start_button";
import { Canvas } from '@react-three/fiber';
import Test3d from "../../components/background_3d/space_scence"

import {
  Stars,
  Sparkles,
  OrbitControls,
} from '@react-three/drei';
import { Suspense } from "react";
/* 컴포넌트 목록 
  - 프로필 V
  - 알림창(우편함) V
  - 설정 V
  - 친구 V
  - 도감 V
  - 운동일지 V
  - 게임(가이드, 자율) 
*/


function HomePage() {
  return (
    <div className={styles.homePage}>
        <Canvas className={styles.canvasBackground} camera={{ position: [0,0,-60], fov: 100}}>
        <ambientLight intensity={9} color={"#c3b6d4"} />
          <Test3d />
        </Canvas>

        <div className={styles.container}>
          <div className={styles.header}>
              <ProfileCard /> {/*프로필*/}
          </div>

          <div className={styles.notification}>
            <SideWidget /> {/*사이드바 위젯*/}
          </div>
          
          <div className={styles.main}>
              <DashBoard /> {/*왼쪽 위젯(친구,도감,일지)*/}
          </div>

          <div className={styles.footer}>
            <StartButton/> {/*운동동시작 버튼*/}
          </div>
        </div>




    </div>
  );
}

export default HomePage;
