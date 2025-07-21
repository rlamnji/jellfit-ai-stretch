// 친구 관련 API 호출 함수들

// 친구 목록 조회
export async function fetchFriends(){
    const token = sessionStorage.getItem("accessToken");

    return fetch("http://localhost:8000/users/friends",{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

// 친구 삭제
export async function deleteFriend(friend_id) {
    const token = sessionStorage.getItem("accessToken");

    return fetch("http://localhost:8000/friends/${friend_id}", {
        method: 'DELETE',
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("accessToken")
        }
    });
}

// 친구 요청 목록
export async function fetchFriendRequests() {
    const token = sessionStorage.getItem("accessToken");

    return fetch("http://localhost:8000/friends/requests", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
}

// 친구 요청 수락
export async function acceptFriendRequest(requesterId) {
    const token = sessionStorage.getItem("accessToken");

    return fetch("http://localhost:8000/friends/accept", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requester_id: requesterId })
    });
}

// 친구 요청 거절
export async function rejectFriendRequest(requesterId) {
    const token = sessionStorage.getItem("accessToken");

    return fetch("http://localhost:8000/friends/reject", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requester_id: requesterId })
    });
}