// 스트레칭 피드백 컴포넌트
import { useState, useEffect, useRef } from 'react';
import {cheersMessages, feedbackMessages} from '../../utils/constants';
import { startChangingRandomItem } from '../../utils/get_random_msg';

function StretchingFeedback({ feedbackMsg }) {
  const [message, setMessage] = useState('');
  const timerRef = useRef(null); // 랜덤 메시지 타이머 제어용

  //피드백 메세지 너무 길어서 해결방안 찾아야 함.
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
        <div className="absolute bottom-[-56px] left-1/2 transform -translate-x-1/2 flex items-center justify-center w-full h-[140px] z-10">
          {/* 해파리 이미지 */}
          <div className="w-[180px] h-[180px]">
            <img src="/images/models/jelly23.png" alt="해파리" className="w-full h-full object-contain" />
          </div>
    
          {/* 피드백 메시지 박스 */}
          <div className="flex items-center justify-center w-full h-16 px-8 bg-white border-4 border-[#975D5D] rounded-full shadow-lg">
            <span className="text-[#694444] py-2 px-12 font-bold text-2xl leading-tight text-center">
              {message}
            </span>
          </div>
        </div>
      );
}

export default StretchingFeedback;