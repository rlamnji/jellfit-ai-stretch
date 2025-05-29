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
        <div className='flex flex-row items-center justify-center'>
            <div className='absolute left-44 w-[240px] h-[240px]'><img src="/images/models/jelly23.png"/></div>
            <div className="flex justify-center w-[1000px] h-[100px] bg-white border-4 border-[#975D5D]  rounded-full">
                <div className="flex items-center text-[40px] text-[#694444] font-bold">{message}</div>
            </div>
        </div>
  );
}
export default StretchingFeedback;