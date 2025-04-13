// 오른쪽 사이드바 위젯(우편함, 설정)
// tailwind css 사용
import { useState } from 'react';

import setting from '../../../assets/images/icons/settings.png';
import mail from '../../../assets/images/icons/mail.png';

// 팝업창
import SettingModal from './setting_modal';
import AlarmModal from './alarm_modal';

function SideWidget() {
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  
  return (
    <div className="flex flex-row p-2 pr-3 w-[150px] justify-between">
        <img src= {mail} className="w-[50px] cursor-pointer pt" onClick={
          () => setOpenModal2(true) }/>
          {openModal2 ?<AlarmModal openModal={openModal2} setOpenModal={setOpenModal2}/> : null}

        <img src= {setting} className="w-[50px] cursor-pointer" onClick={
          () => setOpenModal(true) }/>
          {openModal ?<SettingModal openModal={openModal} setOpenModal={setOpenModal}/> : null}

      
    </div>
  );
}

export default SideWidget;
