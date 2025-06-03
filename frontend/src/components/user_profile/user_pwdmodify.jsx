// 상세프로필 수정 (비번 변경)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordAlertModal from './user_pwd_modal';

function PwdModify(){
    const [isVisible, setIsVisible] = useState(false); // 비밀번호 변경 버튼 클릭 시 투명도 해제
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");

    const [msg, setMsg] = useState("");

    const navigate = useNavigate();

    // 비밀번호 수정 api
    const PwdModify = () =>{

        fetch("http://127.0.0.1:8000/users/change-password",{
            method:"PATCH",
            headers:{
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
            },
            body: JSON.stringify({
                pwd_current: currentPwd,
                pwd_new: newPwd,
                pwd_confirm: confirmPwd
            })
        })
        .then(async (res)=>{
            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.detail || "서버 오류 발생");
            }

            return res.json();
        })
        .then((data) => {
            console.log("응답 결과:", data);
            console.log("비밀번호가 성공적으로 변경되었습니다.");
            setMsg("비밀번호가 성공적으로 변경되었습니다.");
            setTimeout(() => {
                navigate('/login'); // 비밀번호 변경 후 홈으로 이동
            }, 1000); // 1초 후에 홈으로 이동
        })
        .catch((err)=>{
            console.error("에러:", err);

            if (err.message === "현재 비밀번호 불일치") {
                console.log("현재 비밀번호가 일치하지 않습니다.");
                setMsg("현재 비밀번호가 일치하지 않습니다.");
            } else if (err.message === "새 비밀번호와 불일치") {
                console.log("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
                setMsg("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            } else {
                console.log("비밀번호 변경 중 오류가 발생했습니다: " + err.message);
                setMsg("비밀번호 변경 중 오류가 발생했습니다:");
            }
        })       
    }


    return (
        <div className="z-10 flex flex-col justify-start w-[300px] h-[400px] top-3 left-11 ">

            {/* 비밀번호 변경 버튼 클릭 시 투명도 해제*/}
             <div className='flex w-[200px] h-[50px] bg-[#7A7668] rounded-2xl justify-center items-center cursor-pointer' onClick={() => setIsVisible(!isVisible)} >
                <div className='text-[20px] text-white text-center'>비밀번호 변경</div>
             </div>

            <div className={`${isVisible ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className='items-start  pt-4'>
                    <div className='text-[20px] text-[#684E4E] font-bold text-start pb-2'>
                        현재 비밀번호
                    </div>
                    <input
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요."
                    className="text-[15px] h-[10px] w-[300px] px-10 py-6 border bg-white opacity-30 rounded-full"
                    value={currentPwd}
                    onChange={(e)=>setCurrentPwd(e.target.value)}
                    />
                </div>

                <div>
                    <div className='text-[20px] text-[#684E4E] font-bold text-start pt-2 pb-2'>
                        새 비밀번호
                    </div>
                    <div className='pb-2'>
                        <input
                        type="password"
                        placeholder="새 비밀번호를 입력하세요."
                        className="text-[15px] h-[10px] w-[300px] px-10 py-6 border bg-white opacity-30 rounded-full"
                        value={newPwd}
                        onChange={(e)=>setNewPwd(e.target.value)}                        
                        />
                    </div>
                    <div className='pb-4'>
                        <input
                        type="password"
                        placeholder="새 비밀번호를 한 번 더 입력하세요."
                        className="text-[15px] h-[10px] w-[300px] px-10 py-6 border bg-white opacity-30 rounded-full"
                        value={confirmPwd}
                        onChange={(e)=>setConfirmPwd(e.target.value)} 
                        />
                    </div>
                    <div className='flex justify-center'>
                        <div className='flex w-[100px] h-[50px] bg-[#552F2F] rounded-2xl justify-center items-center cursor-pointer'>
                            <div className='text-[20px] text-white text-center' onClick={()=>PwdModify()}>변경</div>
                        </div>
                    </div>


                </div>
            </div>
            {msg && (
            <PasswordAlertModal
                message={msg}
                onClose={() => setMsg("")}
            />
            )}
        </div>
    );
}

export default PwdModify;