// 캐릭터 도감 관련 API 함수들
export async function fetchAllCharacters() {
  return fetch("http://localhost:8000/characters");
}

export async function fetchUserCharacters(token) {
  return fetch("http://localhost:8000/characters/my-characters", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchPoseName(poseId) {
  return fetch(`http://localhost:8000/guide/stretching/${poseId}`);
}

export async function fetchRepeatCount(poseId) {
  return fetch(`http://localhost:8000/users/repeat-count/${poseId}`);
}