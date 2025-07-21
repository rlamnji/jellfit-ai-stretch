import { useEffect, useState } from "react";
import { fetchOwnedCharacters, fetchAllCharacters } from "../api/my_characters_api";

export function useUserCharacters() {
  const [characterUserGetMap, setCharacterUserGetMap] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        console.warn("No token found in sessionStorage");
        return;
      }

      // api 호출
      try {
        const [ownedRes, allRes] = await Promise.all([
          fetchOwnedCharacters(token),
          fetchAllCharacters(),
        ]);

        if (!ownedRes.ok || !allRes.ok) {
          console.error("인증 실패 또는 서버 오류");
          return;
        }

        const owned = await ownedRes.json();
        const all = await allRes.json();

        // 필요한 데이터만 뽑기
        // ownedCharacters는 사용자가 가진 캐릭터의 정보만 필터링
        const ownedCharacters = all.filter((c) =>
          owned.some((o) => o.character_id === c.character_id)
        );

        setCharacterUserGetMap(ownedCharacters);
        
      } catch (err) {
        console.error("데이터 패칭 중 오류 발생:", err);
      }
    };

    fetchData();
  }, []);

  return characterUserGetMap;
}