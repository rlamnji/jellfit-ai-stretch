// 메인 페이지 화면
import ProfileCard from "../home/__components/profile";
import SideWidget from "../../components/menu/side_widget";
import styles from "./home_page.module.css";
import DashBoard from "../home/__components/dash_board";

/* 컴포넌트 목록 
  - 프로필 V
  - 알림창(우편함) V
  - 설정 V
  - 친구
  - 도감
  - 운동일지
  - 게임(가이드, 자율)
*/

function homePage() {
  return (
    <div className={styles.homePage}>
        <div className={styles.header}>
            <ProfileCard /> {/*프로필*/}
            <SideWidget /> {/*사이드바 위젯*/}
        </div>
        
        <div className={styles.main}>
            <DashBoard />
        </div>

    </div>
  );
}

export default homePage;
