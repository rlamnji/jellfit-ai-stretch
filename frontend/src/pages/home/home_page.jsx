// 메인 페이지 화면
import ProfileCard from "../../components/home/profile";
import SideWidget from "../../components/home/menu/side_widget";
import DashBoard from "../../components/home/menu/dash_board";
import StartButton from "../../components/home/start_button";

import styles from "../../styles/pages/home_page.module.css";
import { Canvas } from '@react-three/fiber';
import Test3d from "../../components/home/background_3d/space_scence"


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
            <StartButton/> {/*운동시작 버튼*/}
          </div>
        </div>




    </div>
  );
}

export default HomePage;
