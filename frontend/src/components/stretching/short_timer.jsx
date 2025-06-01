import { useRef } from 'react';
import timerImg from '../../assets/images/icons/short_timer.png';

function ShortTimer({ className, leftElapsedTime, totalTime }) {
    const leftRef = useRef(0);

    // 최대값 유지
    if (leftElapsedTime >= leftRef.current) {
        leftRef.current = leftElapsedTime;
    }

    const renderTime = (elapsed) => {
        if (Math.floor(elapsed) >= totalTime) {
            return "완료!";
        } else {
            return `00:${Math.floor(elapsed)}`;
        }
    };

    return (
        <div className={className}>
            <img className="absolute w-full h-full" src={timerImg} alt="짧은 타이머" />

            <div className='leftTimeArea absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[64%] flex flex-col items-center justify-center'>
                <span className='text-4xl font-bold text-[#975D5D]'>
                    {renderTime(leftRef.current)}
                </span>
                <span className='text-md font-md text-[#999797]'>
                    00:{Math.floor(totalTime)}
                </span>
            </div>
        </div>
    );
}

export default ShortTimer;
