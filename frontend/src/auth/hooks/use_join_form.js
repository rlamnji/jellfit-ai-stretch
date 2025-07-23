// 회원가입 기능 관련 훅
// 라이브러리
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// api
import { joinUser } from "../api/auth_api";

export function useJoinForm(){

    const navigate = useNavigate();

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const isValid = id.length >= 1 && password.length >= 1 && passwordConfirm === password && nickname.length >= 1;
    

    const handleIdInput = (value) =>{ setId(value); };
    const handlePasswordInput = (value) =>{ setPassword(value); };
    const handlePasswordConfirmInput = (value) =>{ setPasswordConfirm(value); };
    const handleNicknameInput = (value) =>{ setNickname(value); };

    /* 회원가입 API를 호출 및 결과 반환 */
    const sendUserJoinData = async (id, password, nickname) =>{

        const result = await joinUser({id, password, nickname});
        if(result.success){
            console.log(result.res);
            return result.res;
        }else{
            alert(result.message);
            return null;
        }

    }

    /* 회원가입 버튼 클릭 시 로직 */
    const handleJoin = async (e) => {
        if (!isValid){
          e.preventDefault();
          return;
        }
      
        const res = await sendUserJoinData(id, password, nickname);
        if (!res) return; // 실패한 경우 빠르게 종료
      
        const { msg, userId, access_token } = await res.json();
        console.log(`${msg} userId : ${userId}`);
        console.log("access_token:", access_token);
      
        sessionStorage.setItem("accessToken", access_token);
      
        setShowSuccessModal(true);
      
        setTimeout(() => {
          navigate(`/condition/${userId}`, { state: { from: "signup" } }); // 회원가입 성공 후 캘리브레이션 페이지로 이동
        }, 1500);
    };

    return {id, password, passwordConfirm, nickname, isValid, showSuccessModal,
        handleIdInput, handlePasswordInput, handlePasswordConfirmInput, handleNicknameInput, sendUserJoinData, handleJoin};
}