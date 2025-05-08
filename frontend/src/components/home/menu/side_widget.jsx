// 오른쪽 사이드바 위젯(설정)
// tailwind css 사용
import { useState } from 'react';

import setting from '../../../assets/images/icons/settings.png';

// 팝업창
import SettingModal from './setting_modal';

function SideWidget() {
  const [openModal, setOpenModal] = useState(false);
  
  return (
    <div className="pr-5 pt-4">
        <img src= {setting} className="w-[50px] cursor-pointer" onClick={
          () => setOpenModal(true) }/>
          {openModal ?<SettingModal openModal={openModal} setOpenModal={setOpenModal}
          /> : null}
    </div>
  );
}

export default SideWidget;
