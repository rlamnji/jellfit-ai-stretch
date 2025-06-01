// 스트레칭 피드백 컴포넌트
import { useState, useEffect, useRef } from 'react';
import {cheersMessages, feedbackMessages} from '../../utils/constants';
import { startChangingRandomItem } from '../../utils/get_random_msg';

function StretchingFeedback({ feedbackMsg }) {
  const [message, setMessage] = useState('');
  const timerRef = useRef(null); // 랜덤 메시지 타이머 제어용

  useEffect(() => {
    // 초기 랜덤 메시지 시작
    timerRef.current = startChangingRandomItem(cheersMessages, setMessage, 4000);

    return () => {
      if (timerRef.current) timerRef.current(); // 정리 함수 호출
    };
  }, []);

  useEffect(() => {
    if (feedbackMsg) {
      // 피드백 메시지가 들어오면 랜덤 메시지 중단하고 피드백 출력
      if (timerRef.current) timerRef.current(); // 랜덤 메시지 중단
      setMessage(feedbackMsg);
    } else {
      // 피드백 메시지가 없어지면 다시 랜덤 메시지 시작
      timerRef.current = startChangingRandomItem(cheersMessages, setMessage, 4000);
    }
  }, [feedbackMsg]);

    return (
        <div className="absolute bottom-0 flex items-center justify-center w-full h-[140px] mt-0">
          {/* 해파리 이미지 */}
          <div className="w-[160px] h-[160px]">
            <img src="/images/models/jelly23.png" alt="해파리" className="w-full h-full object-contain" />
          </div>
    
          {/* 피드백 메시지 박스 */}
          <div className="flex items-center justify-center w-full max-w-[800px] h-auto bg-white border-4 border-[#975D5D] rounded-full shadow-lg px-6">
            <span className="text-[#694444] font-bold text-[32px] leading-tight text-center">
              {message}
            </span>
          </div>
        </div>
      );
}

export default StretchingFeedback;