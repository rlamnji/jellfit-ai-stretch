// 오른쪽 사이드바 위젯(우편함, 설정)
import test from '../../pages/home/__components/test.jpg';
import styles from './side_widget.module.css';

function sideWidget() {
  return (
    <div className={styles.sideWidget}>
      <div className={styles.alarmBox}>
        <img src= {test} />
      </div>
      <div className={styles.settingBox}>
        <img src= {test} />
      </div>
    </div>
  );
}

export default sideWidget;
