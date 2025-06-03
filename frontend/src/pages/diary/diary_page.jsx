import { useState, useEffect } from 'react';
import background from '../../../src/assets/images/etc/basic_background3.png';
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
        console.log("📆 월 선택:", selectedDateMonth);
        if (selectedDateMonth) {
            fetchStretchingTimeByDate(selectedDateMonth);
        }
    }, [selectedDateMonth]);

    // 해파리 랜덤 메시지
    const [randomMsg, setRandomMsg] = useState("");

    const messages = [
        "오늘도 스트레칭 했지?\n스트레칭 일지를 확인해봐!",
        "몸이 좀 풀리는 것 같아!",
        "기록은 습관이 된다!",
        "오늘은 어떤 동작이었을까?",
        "계속하면 분명 달라져!",
        "기록은 너를 배신하지 않아.",
        "스트레칭은 오늘도 나를 살린다.",
        "꾸준함이 최고의 기술이야.",
        "하루 5분, 나를 위한 투자!",
        "내 몸이 고마워할 거야.",
        "기록은 작지만, 힘이 있어.",
        "작은 움직임이 큰 차이를 만든다.",
        "오늘도 나를 돌보는 중 💪",
        "어제보다 더 유연해졌어!",
        "조금 힘들어도, 오늘도 해냈네.",
        "이건 단순한 스트레칭이 아니야,\n나를 위한 약속이야.",
        "몸과 마음, 둘 다 챙기자!",
        "작은 습관이 인생을 바꿔.",
    ];

        useEffect(() => {
            // 최초 진입 시 랜덤 메시지 설정
            setRandomMsg(messages[Math.floor(Math.random() * messages.length)]);

            const interval = setInterval(() => {
            const idx = Math.floor(Math.random() * messages.length);
            setRandomMsg(messages[idx]);
            }, 3000); // 3초마다

            return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
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
            console.log("🎯 API 호출 날짜 파라미터:", date);
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
            <div className='absolute bottom-[5%] left-[10%] w-[10%] animate-float'>
                {/* 말풍선 */}
                <div className="relative mb-2 right-[10%]">
                    <div className="bg-white text-[#532D2D] text-[0.8vw] font-semibold 
                                    w-[130%] px-[6%] py-[6%] 
                                    rounded-xl shadow-md text-center leading-relaxed">
                    {randomMsg}
                    </div>
                    {/* 가운데 꼬리 */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                                    border-l-[6px] border-r-[6px] border-t-[8px] 
                                    border-l-transparent border-r-transparent border-t-white" />
                </div>

                {/* 젤리 이미지 */}
                <img src="/images/models/jelly23.png" alt="jelly" />
            </div>
            
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
                </div>
            </div>
            </div>
        
        </div>
    );
}
export default DiaryPage;