// 스트레칭 피드백 컴포넌트
import { useState, useEffect } from 'react';
import {cheersMessages, feedbackMessages} from '../../utils/constants';
import { startChangingRandomItem } from '../../utils/get_random_msg';

function StretchingFeedback() {
    const [message, setMessage] = useState('');
    

    // 4초마다 응원 메시지 랜덤
    // 스트레칭 피드백은 백엔드에서 받아온 값으로 출력한다치면
    // 4초씩 랜덤띄우다가 api에 똑같은 메시지가 3초씩? 있으면 메시지 출력하기
    useEffect(() => {
        const stop = startChangingRandomItem(cheersMessages, setMessage, 4000);
        return () => stop(); 

        // 백엔드 메시지가 없을 때만 랜덤 메시지 반복
        /*if (!backendMessage) {
        timerRef.current = startChangingRandomItem(cheersMessages, setMessage, 4000);
        } else {
        setMessage(backendMessage); // 백엔드 메시지 즉시 표시
        }*/

    }, []);

    return (
        <div className="flex items-center justify-center w-full h-[140px] mt-2 relative">
          {/* 해파리 이미지 */}
          <div className="w-[160px] h-[160px] absolute -left-40 top-1/2 -translate-y-1/2">
            <img src="/images/models/jelly23.png" alt="해파리" className="w-full h-full object-contain" />
          </div>
    
          {/* 피드백 메시지 박스 */}
          <div className="flex items-center justify-center w-full max-w-[800px] h-full bg-white border-4 border-[#975D5D] rounded-full shadow-lg px-6">
            <span className="text-[#694444] font-bold text-[32px] leading-tight text-center">
              {message}
            </span>
          </div>
        </div>
      );
}

export default StretchingFeedback;