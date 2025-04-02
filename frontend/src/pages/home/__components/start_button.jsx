// 자율모드, 가이드모드 시작 버튼
import styles from './profile.module.css';
import freeModeBtn from './free_mode.png';
import guideModeBtn from './guide_mode.png';

function StartButton() {
  return (
    <div className={styles.startButton}>
        <div className={styles.freeMode}>
            <img src={freeModeBtn} alt="자율모드" />
        </div>
        <div className={styles.guildMode}>
            <img src={guideModeBtn} alt="가이드모드" />
        </div>
    </div>
  );
}

export default StartButton;
