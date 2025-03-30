// 친구, 도감, 운동일지 컴포넌트
import styles from './profile.module.css';
import test from './test.jpg';

function dashBoard() {
  return (
    <div className={styles.dashBoard}>
      <div className={styles.friends}>
        <img src= {test} />
      </div>
      <div className={styles.collectionLog}>
        <img src= {test} />
      </div>
      <div className={styles.exerciseLog}>
        <img src= {test} />
      </div>            
    </div>
  );
}

export default dashBoard;
