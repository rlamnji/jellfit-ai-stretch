// 로그인 기능 관련 훅
// 라이브러리
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// api
import { loginUser } from "../api/auth_api";

export function useLoginForm(){
    const navigate = useNavigate();
    const [id, setId] = useState(''); // ID
    const [password, setPassword] = useState(''); // PWD
    const isValid = id.length >= 1 && password.length >= 1; // 유효성 검사

    // ID, PWD SET
    const handleIdInput = (value) => { setId(value); };
    const handlePasswordInput = (value) => { setPassword(value); };

    const handleLogin = async (e) => {
        if (!isValid){
            e.preventDefault();
        }

        // API 호출
        const result = await loginUser({id, password});

        if(result.success){ // 로그인 성공 시
            sessionStorage.setItem("accessToken", result.token);
            navigate("/home"); 
        } else { // 로그인 실패 시
            alert(result.message);
        }
    };

    return { id, password, isValid, handleIdInput, handlePasswordInput, handleLogin };
}