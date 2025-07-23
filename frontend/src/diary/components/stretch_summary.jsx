// 해파리 말풍선 애니메이션 메시지 컴포넌트
import { useEffect, useState } from 'react';

const messages = [
    "오늘도 스트레칭 했지?\n스트레칭 일지를 확인해봐!",
    "몸이 좀 풀리는 것 같아!",
    "기록은 습관이 된다!",
    "오늘은 어떤 동작이었을까?",
    "계속하면 분명 달라져!",
    "기록은 너를 배신하지 않아.",
    "스트레칭은 오늘도 나를 살린다.",
    "꾸준함이 최고의 기술이야.",
    "하루 5분, 나를 위한 투자!",
    "내 몸이 고마워할 거야.",
    "기록은 작지만, 힘이 있어.",
    "작은 움직임이 큰 차이를 만든다.",
    "오늘도 나를 돌보는 중 💪",
    "어제보다 더 유연해졌어!",
    "조금 힘들어도, 오늘도 해냈네.",
    "이건 단순한 스트레칭이 아니야,\n나를 위한 약속이야.",
    "몸과 마음, 둘 다 챙기자!",
    "작은 습관이 인생을 바꿔.",
];

export function CharacterSpeech() {
    // 해파리 랜덤 메시지
    const [randomMsg, setRandomMsg] = useState("");

    useEffect(() => {
        // 최초 진입 시 랜덤 메시지 설정
        setRandomMsg(messages[Math.floor(Math.random() * messages.length)]);

        const interval = setInterval(() => {
            const idx = Math.floor(Math.random() * messages.length);
            setRandomMsg(messages[idx]);
        }, 3000); // 3초마다
        
        return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
    }, []);


    return(
        <div className='absolute bottom-[5%] left-[10%] w-[10%] animate-float'>
            {/* 말풍선 */}
            <div className="relative mb-2 right-[10%]">
                <div className="bg-white text-[#532D2D] text-[0.8vw] font-semibold 
                                  w-[130%] px-[6%] py-[6%] 
                                rounded-xl shadow-md text-center leading-relaxed">
                    {randomMsg}
                </div>
            {/* 가운데 꼬리 */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                                    border-l-[6px] border-r-[6px] border-t-[8px] 
                                    border-l-transparent border-r-transparent border-t-white" />
                </div>

            {/* 젤리 이미지 */}
                <img src="/images/models/jelly23.png" alt="jelly" />
        </div>
    );

}