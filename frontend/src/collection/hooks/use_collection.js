import { useState, useEffect } from 'react';
import {
  fetchAllCharacters,
  fetchUserCharacters,
  fetchPoseName,
  fetchRepeatCount,
} from '../api/characters';

export function useCollection() {
  const [characterMap, setCharacterMap] = useState([]); // 전체 캐릭터
  const [characterUserGetMap, setCharacterUserGetMap] = useState([]); // 사용자가 가진 캐릭터 id
  const [selectedCharacterId, setSelectedCharacterId] = useState(null); // 현재 선택된 id 번호

  const [poseId, setPoseId] = useState(null); // pose_id 저장용
  const [poseName, setPoseName] = useState(''); // 스트레칭 이름 저장용
  const [userCnt, setUserCnt] = useState(0); // 스트레칭 누적 횟수 저장용

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');

    const fetchData = async () => {
      try { // 최초 렌더링 시 전체 캐릭터와 내 캐릭터 조회
        const [allRes, userRes] = await Promise.all([
          fetchAllCharacters(),
          fetchUserCharacters(token),
        ]);

        if (!allRes.ok || !userRes.ok) throw new Error('Failed to fetch');

        const allData = await allRes.json();
        const userData = await userRes.json();

        setCharacterMap(allData);
        setCharacterUserGetMap(userData);

      } catch (e) {
        console.error(e);
      }
    };
    
    fetchData();
  }, []);

  // pose_id에 맞는 스트레칭 이름 가져오는 api
  useEffect(() => {
    const selected = characterMap.find(c => c.character_id === selectedCharacterId);
    if (selected) {
      setPoseId(selected.pose_id);
    }
  }, [selectedCharacterId, characterMap]);

  useEffect(() => {
    if (!poseId) return;

    const fetchPoseData = async () => {
      try {
        const [nameRes, cntRes] = await Promise.all([
          fetchPoseName(poseId),
          fetchRepeatCount(poseId),
        ]);
        if (!nameRes.ok || !cntRes.ok) throw new Error('Pose fetch failed');
        const nameData = await nameRes.json();
        const cntData = await cntRes.json();
        setPoseName(nameData.name); // 자세 이름
        setUserCnt(cntData.repeat_cnt); // 사용자 누적 횟수

      } catch (e) {
        console.error(e);
      }
    };

    fetchPoseData();
  }, [poseId]);

  const selectCharacter = (id) => setSelectedCharacterId(id);

  // selectedCharacterId를 기반으로 전체 캐릭터 리스트에서 해당 캐릭터 정보 찾기
  const fullCharacter = characterMap.find(c => c.character_id === selectedCharacterId);
  // characterUserGetMap에 선택된 캐릭터 ID가 있는지 여부 (획득 여부 판단)
  const isUnlocked = characterUserGetMap.some(c => c.character_id === selectedCharacterId);

  return {
    characterMap,
    characterUserGetMap,
    selectedCharacterId,
    setSelectedCharacterId,
    fullCharacter,
    isUnlocked,
    poseName,
    userCnt,
    selectCharacter,
  };
}