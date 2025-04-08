// 프로필 컴포넌트
import styles from '../../styles/components/profile.module.css';
import test from './test.jpg';

function ProfileCard() {
  return (

    <div className={styles.profileCard}>
      <div className={styles.profileImage}>
        <img src= {test} />
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileName}>닉네임</div>
        <div className={styles.profileIntro}>한줄소개입니다.</div>
      </div>
    </div>
  );
}

export default ProfileCard;
