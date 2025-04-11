// 친구 요청청 컴포넌트
import { useNavigate } from 'react-router-dom';
import styles from '../../../src/styles/components/friends.module.css';

// 이미지
import background from '../../assets/images/etc/basic_background2.png';
import arrow from '../../assets/images/icons/arrow.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
import workLog from '../../assets/images/icons/friends/friends_log.png';
import deleteBtn from '../../assets/images/icons/friends/friends_delete.png';
import testImg from '../../components/home/test.jpg';

function FriendRequest({ setSelectedTab }) {
  const navigate = useNavigate();

  return (
    <div className={styles.friends}>
      <img
        src={background}
        alt="Background"
        style={{
          position: 'fixed',          
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',     
          zIndex: -1
        }}
      />
      <img src={arrow} className={styles.back} onClick={()=>navigate('/home')}/>
  
      <div className={styles.friendsCategory}>
        
          <div className={styles.category} onClick={()=>{console.log('친구  눌림'); setSelectedTab('내 친구') }}>내 친구</div>
          <div className={styles.category} onClick={()=>{console.log('친구 검색눌림'); setSelectedTab('친구 검색')}}>친구 검색</div>
          <div className={styles.categorySelect} onClick={()=>{console.log('친구 요청 눌림'); setSelectedTab('요청 목록')}}>요청 목록</div>
          
      </div>

      

      <div className={styles.friendsTitles}>
        <img className={styles.friendsTitle} src={friendsContent}/>
        <div className={styles.friendsHeader}>REQUEST LIST</div>
        </div>
      
    </div>
  );
}

export default FriendRequest;
