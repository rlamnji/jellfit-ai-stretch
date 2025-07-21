// 프로필 : 사용자 정보 조회 API
export async function fetchUserProfile() {
    return fetch(`http://127.0.0.1:8000/get/me`,{
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
        }
    });
}

// 프로필 : 스트레칭 총 누적시간 조회 API
// 오늘 날짜 기준
export async function fetchStretchingTimeByDate(date){
    const token = sessionStorage.getItem("accessToken");
        return fetch(`http://localhost:8000/users/stretch-time?date=${date}`,{
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
        }
    });
}