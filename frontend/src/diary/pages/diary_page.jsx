import { useState, useEffect } from 'react';
import background from '../../../src/assets/images/etc/basic_background3.png';
import TopBar from '../../common/components/top_bar';

import { StretchSummary } from '../components/character_speech';
import { CharacterSpeech } from '../components/stretch_summary';

import { useStretchData } from '../hooks/use_stretch_data';

function DiaryPage(){
    // 월 누적 시간 검색 예시 (드롭박스)
    const [selectedDateMonth, setSelectedDateMonth] = useState('2025-06');
    const currentDate = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }); // 현재 날짜 포맷팅 (예: 2025년 6월 1일)

    const { usageTime, detailMonthData } = useStretchData(selectedDateMonth);

    // 드롭박스 옵션 생성
    const getMonthOptions = () => {
        const options = [];

        for (let i = 0; i < 6; i++) {
            // i만큼 빼기 전에 바로 new Date()에서 setMonth
            const localDate = new Date();
            localDate.setMonth(localDate.getMonth() - i);

            const year = localDate.getFullYear();
            const month = (localDate.getMonth() + 1).toString().padStart(2, '0');

            const value = `${year}-${month}`;
            const label = `${year}년 ${month}월`;

            options.push({ value, label });
        }

        return options;
    };

    return(
        <div className='w-full h-screen overflow-y-hidden'>
            <img
            src={background}
            alt="Background"
            className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
        />
            <TopBar />
            <CharacterSpeech />
                
            <div className='main flex justify-center items-center h-screen'>
            <div className='flex flex-col items-center justify-center relative w-[38%] h-[80%] bg-[#e0ded6] opacity-80 rounded-[3vw] shadow-lg border border-[#532d2d99]'>
                <h1 className='mb-[3%] mt-[2%] font-bold text-[2.5vw] text-[#532D2D]'>스트레칭 일지</h1>

                <div className='flex flex-col items-center contentBox w-[85%] h-[80%] px-[5%] pt-[5%] rounded-[3vw] border-[3px] border-[#532d2d35]'>
                
                {/* 날짜 */}
                <div className='date mb-[4%] text-[1.2vw] text-[#B5B0AA]'>{currentDate}</div>

                {/* 드롭박스 */}
                <div className="relative mb-[3%]">
                    <select
                    className="bg-[#e0ded6] text-[#8D6755] px-[1.5vw] py-[0.8vw] rounded-xl focus:ring-2 focus:ring-[#CDBA94] cursor-pointer text-[1.2vw]"
                    value={selectedDateMonth}
                    onChange={(e) => {
                        const newMonth = e.target.value;
                        console.log("📅 선택한 월:", newMonth);
                        setSelectedDateMonth(newMonth);
                    }}
                    >
                    {getMonthOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                        {opt.label}
                        </option>
                    ))}
                    </select>
                </div>

                {/* 스트레칭 누적 시간, 날짜별 시간 리스트 표시 컴포넌트 */}
                <StretchSummary usageTime={usageTime} detailMonthData={detailMonthData} />
                </div>
            </div>
            </div>
        
        </div>
    );
}
export default DiaryPage;