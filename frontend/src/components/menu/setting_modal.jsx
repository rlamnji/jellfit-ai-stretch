// 환경설정 팝업창
import style from './modal.module.css';
import { useState } from 'react';

function SettingModal ({openModal,setOpenModal}){
    return (
        <div className={style.Overlay}>
            <div className={style.setting}>
                <h1>환경설정</h1>
                <button className={style.close} onClick={() => setOpenModal(false)}>완료</button>
                {!openModal ? setOpenModal(true) : null}
            </div>
        </div>
    );

}

export default SettingModal;