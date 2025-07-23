// 오른쪽 사이드바 위젯(설정)

// 라이브러리
import { useState } from 'react';
// 컴포넌트
import SettingModal from '../settings/setting_modal';
// 이미지/에셋
import setting from '../../../assets/images/icons/settings.png';

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
