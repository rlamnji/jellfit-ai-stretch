import { useState } from 'react';
// 오른쪽 사이드바 위젯(우편함, 설정)
import setting from '../../../assets/images/icons/settings.png';
import mail from '../../../assets/images/icons/mail.png';
import styles from '../../../styles/components/side_widget.module.css';

// 팝업창
import SettingModal from './setting_modal';
import AlarmModal from './alarm_modal';

function SideWidget() {
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  return (
    <div className={styles.sideWidget}>
      <div className={styles.alarmBox}>
        <img src= {mail} onClick={
          () => setOpenModal2(true) }/>
          {openModal2 ?<AlarmModal openModal={openModal2} setOpenModal={setOpenModal2}/> : null}
      </div>

      <div className={styles.settingBox}>
        <img src= {setting} onClick={
          () => setOpenModal(true) }/>
          {openModal ?<SettingModal openModal={openModal} setOpenModal={setOpenModal}/> : null}
      </div>
      
    </div>
  );
}

export default SideWidget;
