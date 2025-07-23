// 상세 프로필 API
// 로그아웃
export async function logout() {
    const accessToken = sessionStorage.getItem("accessToken");
    return fetch("http://127.0.0.1:8000/auth/logout", {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    });
}


// 사용자 정보 변경
export async function modifyUserProfile(user_id, selectedProfile, username, introduction){
    return fetch(`http://127.0.0.1:8000/users/${user_id}/change-detail`,{
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            profile_url: selectedProfile,
            username: username,
            introduction: introduction
        }),
    });
}

// 비밀번호 수정
export async function modifyPassword(currentPwd, newPwd, confirmPwd) {

    return fetch("http://127.0.0.1:8000/users/change-password", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
        },
        body: JSON.stringify({
            pwd_current: currentPwd,
            pwd_new: newPwd,
            pwd_confirm: confirmPwd,
        }),
        
    });

    
}