// 획득한 캐릭터를 홈화면에 렌더링하는 API

// 현재 획득한 캐릭터 정보 조회
export async function fetchOwnedCharacters(token) {
  return fetch("http://localhost:8000/characters/my-characters", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
// 전체 캐릭터 정보 조회
export async function fetchAllCharacters() {
  return fetch("http://localhost:8000/characters");
}