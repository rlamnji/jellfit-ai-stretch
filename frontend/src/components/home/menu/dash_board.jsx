// 친구, 도감, 운동일지 컴포넌트
import { useNavigate } from 'react-router-dom';

import styles from '../../../styles/components/profile.module.css';

import friends from '../../../assets/images/icons/home/home_friends.png';
import collections from '../../../assets/images/icons/home/home_collect.png';
import exercise from '../../../assets/images/icons/home/home_exercise.png';

function DashBoard() {
  const navigate = useNavigate();

  return (
    <div className={styles.dashBoard}>
      <div className={styles.dashBoardDetail}>
        <img className={styles.friends} src= {friends} onClick={()=>navigate('/home/friends')}/>
        <img className={styles.collectionLog} src= {collections} onClick={()=>navigate('/home/collection')}/>
        <img className={styles.exerciseLog} src= {exercise} />          
      </div>
      
    </div>
  );
}

export default DashBoard;
