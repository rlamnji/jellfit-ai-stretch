// 친구, 도감, 운동일지 컴포넌트
import { useNavigate } from 'react-router-dom';

import styles from './profile.module.css';
import test from './test.jpg';

function DashBoard() {
  const navigate = useNavigate();

  return (
    <div className={styles.dashBoard}>
      <div className={styles.friends}>
        <img src= {test} onClick={()=>navigate('/profile')}/>
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

export default DashBoard;
