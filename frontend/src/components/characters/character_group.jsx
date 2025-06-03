// 홈화면용 캐릭터 랜덤 렌더링
import { useRef, useEffect, useState } from "react";
import AnimatedCharacter from "./animated_character";

function CharacterGroup({ ownedCharacters }) {
  const containerRef = useRef(null);
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });
  const [positions, setPositions] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]); // 랜덤 최대 n개까지

  useEffect(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setAreaSize({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

  useEffect(() => {
    if (ownedCharacters.length > 0) {
      const shuffled = [...ownedCharacters].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, 7); // 최대 7개만
      setSelectedCharacters(picked);
    }
  }, [ownedCharacters]);

  useEffect(() => {
    if (areaSize.width > 0 && ownedCharacters.length > 0) {
      const newPositions = [];
      const size = 200; // 캐릭터 이미지 크기

      function isOverlapping(x, y) {
        return newPositions.some(p => {
          return (
            Math.abs(p.x - x) < size &&
            Math.abs(p.y - y) < size
          );
        });
      }

      selectedCharacters.forEach(() => {
        let tries = 0;
        let x = 0, y = 0;

        do {
          x = Math.random() * (areaSize.width - size);
          y = Math.random() * (areaSize.height - size);
          tries++;
        } while (isOverlapping(x, y) && tries < 50);

        newPositions.push({ x, y });
      });

      setPositions(newPositions);
    }
  }, [areaSize, selectedCharacters]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        ref={containerRef}
        className="left-52 bottom-16 w-[80vw] h-[65vh] relative -translate-x-[5vw] overflow-visible"
      >
        {positions.length > 0 &&
          selectedCharacters.map((c, i) => (
            <AnimatedCharacter
              key={c.character_id}
              character={c}
              position={positions[i]}
            />
          ))}
      </div>
    </div>
  );
}

export default CharacterGroup;
