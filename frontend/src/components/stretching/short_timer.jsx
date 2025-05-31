import timerImg from '../../assets/images/icons/short_timer.png';

function ShortTimer({ className, leftElapsedTime, totalTime }) {
    //바뀐 경과시간을 그대로 렌더링.
    return (
        <div className={className}>
            <img className="absolute w-full h-full" src={timerImg} alt="긴 타이머" />

            <div className='leftTimeArea absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[64%] flex flex-col items-center justify-center'>
                <span className='text-4xl font-bold text-[#975D5D]'>00:{Math.floor(leftElapsedTime)}</span>
                <span className='text-md font-md text-[#999797]'> 00:{totalTime}</span>
            </div>
        </div>
    );
}
export default ShortTimer;