// 프로필 변경 훅
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, modifyUserProfile } from '../api/user_detail_profile';

export function useUserProfile() {
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");

    // 사용자 정보 변경 함수
    const changeUserProfile = async (user_id, selectedProfile, username, introduction) => {
        try {
            const res = await modifyUserProfile(user_id, selectedProfile, username, introduction);
            if (!res.ok) {
                throw new Error("프로필 변경 실패");
            }
            const data = await res.json();
            console.log("프로필 변경 성공:", data);
            setMsg("프로필 정보가 성공적으로 변경되었습니다.");

            setTimeout(() => {
                navigate('/home'); // 프로필 변경 후 홈으로 이동
            }, 2000); // 2초 후에 홈으로 이동
            
            return data;
        } catch (err) {
            console.error("프로필 변경 중 오류 발생:", err);
            setMsg("프로필 변경 중 오류가 발생했습니다: " + err.message);
        }
    };

    // 로그아웃 함수
    const handleLogout = async () => {
        try {
            const res = await logout();
            if (!res.ok) {
                throw new Error("로그아웃 실패");
            }
            sessionStorage.removeItem("accessToken");
            navigate('/login');
        } catch (err) {
            console.error("로그아웃 중 오류 발생:", err);
        }
    };

    return { changeUserProfile, handleLogout, msg, setMsg };

}