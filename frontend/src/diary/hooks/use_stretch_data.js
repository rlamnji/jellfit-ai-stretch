import { useEffect, useState } from 'react';

// 스트레칭 총 누적시간 api (특정 월의 누적시간 조회)
// 입력데이터 : 2025-05
export function useStretchData(selectedDateMonth) {
  const [usageTime, setUsageTime] = useState("로딩중 ...");
  const [detailMonthData, setDetailMonthData] = useState([]);

  useEffect(() => {
    if (!selectedDateMonth) return;

    const token = sessionStorage.getItem('accessToken');
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/users/stretch-time/month?month=${selectedDateMonth}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const data = await response.json();

        // 출력 데이터
        console.group(`1. 조회한 월: ${selectedDateMonth}`);
        console.log("🎯 API 호출 날짜 파라미터:", selectedDateMonth);
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

        setUsageTime(data.total_usage_time);
        setDetailMonthData(data.daily_records || []);

      } catch (error) {
        console.error("날짜별 스트레칭 시간 조회 실패:", error);
      }
    };

    fetchData();
  }, [selectedDateMonth]);

  return { usageTime, detailMonthData };
}