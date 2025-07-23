// auth 관련 api 호출 (오류 처리 및 리턴 구조 포함)

// 회원가입
export async function joinUser({id, password, nickname}){
    try{
        const res = await fetch("http://localhost:8000/auth/join", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                id : id,
                password : password,
                nickname : nickname
            })
        });
        if(res.ok){
            return {success: true, res: res};
        } else {
            return {success: false, message: "회원가입에 실패했습니다.", res: res};
        }
    } catch(error){
        return { success: false, message: "서버 연결에 실패했습니다."};
    }

}

// 로그인
export async function loginUser({id, password}){
    try {
        const formData = new URLSearchParams();
        formData.append("username", id);
        formData.append("password", password);

        const res = await fetch("http://localhost:8000/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
         });

        if (res.ok) { // 토큰 저장
            const data = await res.json();
            return { success: true, token: data.access_token};

        } else if (res.status === 401) {
            return { success: false, message: "아이디 또는 비밀번호가 잘못되었습니다."};
        } else {
            return { success: false, message: "로그인 중 알 수 없는 오류가 발생했습니다."};
        }

    } catch (error) {
        return { success: false, message: "서버 연결에 실패했습니다."};
    }
}
