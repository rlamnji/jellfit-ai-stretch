// 프로필 컴포넌트
import styles from '../../styles/components/profile.module.css';
import profileImg from '../../../src/assets/images/icons/home/profile_user.png';
import test from './test.jpg';

function ProfileCard() {
  return (
    <div className={styles.profileCard}>
    <img src={profileImg} className={styles.profileImage2} alt="배경 데코" />
    <img src={test} className={styles.profileImage} alt="프로필" />
  
    <div className={styles.profileContent}>
      <div className={styles.profileName}>닉네임</div>
      <div className={styles.profileIntro}>한줄소개입니다.</div>
    </div>
  </div>
  );
}

export default ProfileCard;
