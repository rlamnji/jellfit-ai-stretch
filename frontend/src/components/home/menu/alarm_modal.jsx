// 환경설정 팝업창
import style from '../../../styles/components/modal.module.css';
import setModal  from '../../../assets/images/icons/mail_content.png';
import setCancel  from '../../../assets/images/icons/cancel.png';
import settingsOn  from '../../../assets/images/icons/settings_on.png';
import { useState } from 'react';

function AlarmModal ({openModal,setOpenModal}){
    return (
        <div className={style.Overlay}>
            <div className={style.setModalBox}>
                <div className={style.setModal}>
                    <img src={setModal} />
                </div>
                <div className={style.setCancel}>
                    <img src={setCancel} onClick={() => setOpenModal(false)}/>
                </div>
            </div>
            {!openModal ? setOpenModal(true) : null}
        </div>
    );

}

export default AlarmModal;