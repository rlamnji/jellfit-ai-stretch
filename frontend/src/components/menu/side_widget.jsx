import { useState } from 'react';
// 오른쪽 사이드바 위젯(우편함, 설정)
import setting from './settings.png';
import mail from './mail.png';
import styles from './side_widget.module.css';

// 팝업창
import SettingModal from '../menu/setting_modal';

function SideWidget() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <div className={styles.sideWidget}>
      <div className={styles.alarmBox}>
        <img src= {mail} onClick={
          () => setOpenModal(true) }/>
          {openModal ?<SettingModal openModal={openModal} setOpenModal={setOpenModal}/> : null}
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
