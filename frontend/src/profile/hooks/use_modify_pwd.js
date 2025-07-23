// 비밀번호 변경 훅
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { modifyPassword } from '../api/user_detail_profile';

export function useModifyPwd() {
    const navigate = useNavigate();

    const [msg, setMsg] = useState("");

    const changePassword = async (currentPwd, newPwd, confirmPwd) => {


        try {
            const res = await modifyPassword(currentPwd, newPwd, confirmPwd);
            if (!res) return; // 실패한 경우 빠르게 종료

            if (!res.ok) {
                throw new Error("비밀번호 변경 실패");
            }

            const data = await res.json();

            console.log("응답 결과:", data);
            console.log("비밀번호가 성공적으로 변경되었습니다.");
            setMsg("비밀번호가 성공적으로 변경되었습니다.");
            setTimeout(() => {
                navigate('/login'); // 비밀번호 변경 후 홈으로 이동
            }, 1000); // 1초 후에 홈으로 이동

            return data;

        } catch (err) {
            console.error("에러:", err);

            if (err.message === "현재 비밀번호 불일치") {
                console.log("현재 비밀번호가 일치하지 않습니다.");
                setMsg("현재 비밀번호가 일치하지 않습니다.");
            } else if (err.message === "새 비밀번호와 불일치") {
                console.log("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
                setMsg("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            } else {
                console.log("비밀번호 변경 중 오류가 발생했습니다: " + err.message);
                setMsg("비밀번호 변경 중 오류가 발생했습니다: " + err.message);
            }
        }
    };

    return { changePassword,  msg, setMsg };
}