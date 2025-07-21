import React, { useState, useEffect, useRef } from 'react';
import planetImg from '../../assets/images/icons/planet_1.png';

function StretchingSteps({ className, stretchingOrder, currentStretchingIndex }) {
  const [stretchingNames, setStretchingNames] = useState([]);
  const itemRefs = useRef([]); // 각 항목의 높이를 참조

  useEffect(() => {
    async function fetchAllStretchingNames() {
      const names = await Promise.all(
        stretchingOrder.map(async (id) => {
          const data = await getStretchingData(id);
          return data ? data.name : '불러오기 실패';
        })
      );
      setStretchingNames(names);
    }

    if (stretchingOrder.length > 0) {
      fetchAllStretchingNames();
    }
  }, [stretchingOrder]);

  async function getStretchingData(stretchingId) {
    try {
      const res = await fetch(`http://localhost:8000/guide/stretching/${stretchingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        return await res.json();
      } else {
        console.error(`ID ${stretchingId} 스트레칭 없음`);
        return null;
      }
    } catch (err) {
      console.error('에러 발생:', err);
      return null;
    }
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
    {stretchingNames.map((name, idx) => (
        <div
        key={idx}
        className={`relative flex items-start mb-6 ${
            idx !== stretchingNames.length - 1 ? 'after:absolute after:left-4 after:top-8 after:w-[2px] after:h-full after:bg-[#C0B8B8] after:z-[-1]' : ''
        }`}
        >
        {/* 행성 + 텍스트 */}
        <div className="flex items-start space-x-4">
            <img
            src={planetImg}
            alt="planet"
            className={`w-8 h-8 mt-1 ${idx === currentStretchingIndex ? '' : 'grayscale'}`}
            />
            <span
            className={`text-xl break-words ${
                idx === currentStretchingIndex ? 'font-bold text-white' : 'text-gray-300'
            }`}
            >
            {name}
            </span>
        </div>
        </div>
    ))}
    </div>

  );
}

export default StretchingSteps;
