import { useState, useEffect } from 'react';
import background from '../../../src/assets/images/etc/basic_background2.png';
import TopBar from '../../components/top_bar';

function DiaryPage(){
    const token = sessionStorage.getItem('accessToken');
    const [usageTime, setUsageTime] = useState("로딩중 ...");
    const [detailMonthData, setDetailMonthData] = useState([]);
    // 월 누적 시간 검색 예시 (드롭박스)
    const [selectedDateMonth, setSelectedDateMonth] = useState('2025-06');
    const currentDate = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }); // 현재 날짜 포맷팅 (예: 2025년 6월 1일)

    useEffect(() => {
        fetchStretchingTimeByDate(selectedDateMonth);
    }, []);

    // 스트레칭 총 누적시간 api (특정 월의 누적시간 조회)
    // 입력데이터 : 2025-05
    const fetchStretchingTimeByDate = async (date) => {
        try {
            const response = await fetch(`http://localhost:8000/users/stretch-time/month?month=${date}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token, 
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 출력 데이터
            console.group(`1. 조회한 월: ${date}`);
            console.log("2. 총 스트레칭 시간:", data.total_usage_time + "초");

            if (data.daily_records && data.daily_records.length > 0) {
                console.log("3. 상세 일별 기록:");
                data.daily_records.forEach((record) => {
                    console.log(` - ${record.date}: ${record.usage_time}초`);
                });
            } else {
                console.log("상세 기록 없음");
            }
            console.groupEnd();

            setUsageTime(data.total_usage_time); // 총 누적 스트레칭 시간 저장
            setDetailMonthData(data.daily_records); // 일별 스트레칭 시간 데이터 저장
            return data;

        } catch (error) {
            console.error("날짜별 스트레칭 시간 조회 실패:", error);
        }
    };

    // 최근 6개월 옵션을 반환
    const getMonthOptions = () => {
        const options = [];
        const today = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const value = date.toISOString().slice(0, 7); // '2025-06'
            const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
            options.push({ value, label });
        }

        return options;
    };

    return(
        <div className='w-full h-screen'>
            <img
            src={background}
            alt="Background"
            className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
        />
        <TopBar />
            <div className='main flex justify-center items-center'>
                <div className='flex flex-col items-center justify-center w-[480px] h-[600px] bg-[#F3F1E6] opacity-80 rounded-[48px]'>
                    <h1 className='m-4 mb-8 font-bold text-4xl text-[#532D2D]'>스트레칭 일지</h1>
                    <div className='flex flex-col items-center contentBox w-[440px] h-[496px] pl-8 pr-8 pt-8 rounded-[48px] border border-[#532D2D]'>
                        <div className='date mb-6 text-xl text-[#B5B0AA]'>{currentDate}</div>
                        {/* 월 선택 드롭박스 */}
                        <div className="relative mb-4">
                            <select
                                className="bg-[#F3F1E6] text-[#8D6755] px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#CDBA94] cursor-pointer"
                                value={selectedDateMonth}
                                onChange={(e) => {
                                    const newMonth = e.target.value;
                                    setSelectedDateMonth(newMonth);
                                    fetchStretchingTimeByDate(newMonth);
                                }}
                            >
                                {getMonthOptions().map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                    </option>
                            ))}
                            </select>
                        </div>
                        <section className='flex flex-col h-[120px] items-center'>
                            <h1 className='font-bold text-2xl text-[#522B2B] text-opacity-80'>스트레칭 누적 시간</h1>
                            <div className='textLine w-[300px] h-[1px] mt-1 bg-[#D9D9D9]'></div>
                            <div className='text-[30px] text-[#552F2F]'>
                                {usageTime !== null ? (
                                    <>
                                    <span className="text-[40px] font-semibold mr-1">
                                        {Math.floor(usageTime / 60)}
                                    </span>
                                    <span className="text-[14px] text-[#CDBA94] mr-3">분</span>
                                    <span className="text-[40px] font-semibold mr-1">
                                        {usageTime % 60}
                                    </span>
                                    <span className="text-[14px] text-[#CDBA94]">초</span>
                                    </>
                                ) : (
                                    "로딩 중..."
                                )}
                                </div>
                        </section>
                        <section className='flex flex-col h-[120px] items-center mt-8'>
                            <h1 className='font-bold text-2xl text-[#522B2B] text-opacity-80'>날짜 별 스트레칭 시간</h1>
                            <div className='textLine w-[300px] h-[1px] mt-1 bg-[#D9D9D9]'></div>
                        </section>
                            <div className='flex flex-col items-center gap-2 mt-2 w-[300px] h-[500px] overflow-y-auto'>
                                {detailMonthData.map((record, idx) => (
                                    <div key={idx} className='flex flex-row gap-8 mb-2'>
                                        <div className='bg-[#868361] opacity-40 w-10 h-10 flex items-center justify-center text-white rounded-full mr-8'>{record.date}</div>
                                        <div className='text-[#535353] text-2xl'>{Math.floor(record.usage_time / 60)}m {record.usage_time % 60}s</div>
                                    </div>
                                ))}
                            </div>                        
                    </div>
                </div>

            </div>
        </div>
    );
}
export default DiaryPage;