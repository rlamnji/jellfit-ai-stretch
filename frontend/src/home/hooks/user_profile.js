import { fetchUserProfile, fetchStretchingTimeByDate } from "../api/user_profile_api";
import { useEffect, useState } from "react";

// 사용자 프로필 훅(사용자 정보)
export function useUserProfile(){
    // 사용자 프로필 데이터 상태
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const getUserProfile = async () => {
            try {
                const response = await fetchUserProfile();
                if (!response.ok) {
                    throw new Error("네트워크 오류");
                }
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error("사용자 프로필 조회 중 오류 발생:", error);
            }
        };

        getUserProfile();
    }, []);

    return { userData };
}

// 사용자 프로필 훅(스트레칭 누적시간)
export function useUserStretchingTime() {
    const [usageTime, setUsageTime] = useState("로딩중...");

    // 스트레칭 총 누적시간 api (오늘날짜)
    const getStretchingTimeByDate = async (date) => {
        try {
            const response = await fetchStretchingTimeByDate(date);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUsageTime(data.usage_time);
            console.log("📅 조회한 날짜:", date);
            console.log("⏱️ 스트레칭 시간:", data.usage_time + "초");
            
            return data;

        } catch (error) {
            console.error("날짜별 스트레칭 시간 조회 실패:", error);
        }
    };

    return { usageTime, getStretchingTimeByDate };
}