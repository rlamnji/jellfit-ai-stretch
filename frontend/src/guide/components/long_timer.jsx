import { useRef } from 'react';
import timerImg from '../../assets/images/icons/long_timer.png';

function LongTimer({ className, leftElapsedTime, rightElapsedTime, totalTime }) {
    const leftRef = useRef(0);
    const rightRef = useRef(0);

    if (leftElapsedTime >= leftRef.current) {
        leftRef.current = leftElapsedTime;
    }
    if (rightElapsedTime >= rightRef.current) {
        rightRef.current = rightElapsedTime;
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
            <img className="absolute w-full h-full" src={timerImg} alt="긴 타이머" />

            <div className='leftTimeArea absolute top-5 left-16 flex flex-col items-center justify-center'>
                <span className='text-3xl font-bold text-[#975D5D]'>
                    {renderTime(leftRef.current)}
                </span>
                <span className='text-md font-md text-[#999797]'>00:{Math.floor(totalTime)}</span>
            </div>

            <div className='rightTimeArea absolute top-5 right-16 flex flex-col items-center justify-center'>
                <span className='text-3xl font-bold text-[#975D5D]'>
                    {renderTime(rightRef.current)}
                </span>
                <span className='text-md font-md text-[#999797]'>00:{Math.floor(totalTime)}</span>
            </div>
        </div>
    );
}

export default LongTimer;
