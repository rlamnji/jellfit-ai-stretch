// 스트레칭 누적 시간, 날짜별 시간 리스트 표시 컴포넌트
export function StretchSummary({usageTime, detailMonthData}){
    return(
        <>
            {/* 누적 시간 */}
                <section className='flex flex-col h-[15%] items-center'>
                    <h1 className='font-bold text-[1.6vw] text-[#522B2B] text-opacity-80'>스트레칭 누적 시간</h1>
                    <div className='textLine w-full h-[1px] mt-[2%] bg-[#c0c0c0]'></div>
                    <div className='text-[1.8vw] text-[#552F2F] mt-[1%]'>
                        {usageTime !== null ? (
                            <>
                            <span className="text-[3vw] font-semibold mr-[0.5vw]">
                                {Math.floor(usageTime / 60)}
                            </span>
                            <span className="text-[1vw] text-[#CDBA94] mr-[1vw]">분</span>
                            <span className="text-[3vw] font-semibold mr-[0.5vw]">
                                {usageTime % 60}
                            </span>
                            <span className="text-[1vw] text-[#CDBA94]">초</span>
                            </>
                        ) : (
                            "로딩 중..."
                        )}
                    </div>
                </section>

            {/* 날짜별 시간 */}
                <section className='flex flex-col h-[15%] items-center mt-[20%] mb-[3%]'>
                    <h1 className='font-bold text-[1.6vw] text-[#522B2B] text-opacity-80'>날짜 별 스트레칭 시간</h1>
                    <div className='textLine w-full h-[1px] mt-[2%] bg-[#c0c0c0]'></div>
                </section>

            {/* 리스트 */}
                <div className='flex flex-col items-center gap-[4%] w-[60%] h-[80%] overflow-y-auto  mb-[3%]'>
                    {detailMonthData.map((record, idx) => {
                    const [month, day] = record.date.split('/').map(Number);
                    const correctedDate = new Date(2025, month - 1, day);
                    correctedDate.setDate(correctedDate.getDate());
                    const correctedMonth = correctedDate.getMonth() + 1;
                    const correctedDay = correctedDate.getDate();

                    return (
                        <div key={idx} className='flex flex-row gap-[4vw] mb-[0.5vw] items-center'>
                            <div className='bg-[#868361] opacity-40 w-[3vw] h-[3vw] flex items-center justify-center text-white text-[1vw] rounded-full'>
                                {correctedMonth}/{correctedDay}
                            </div>
                            <div className='text-[#535353] text-[1.5vw]'>
                                {Math.floor(record.usage_time / 60)}분 {record.usage_time % 60}초
                            </div>
                        </div>
                        );
                    })}
                </div>
        </>
    );
}