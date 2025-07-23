// 프로필 컴포넌트

// 라이브러리
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 이미지/에셋
import profileImg from '../../../assets/images/icons/home/profile_user.png';
import test from '../../../assets/images/test.jpg'

import { useUserProfile, useUserStretchingTime } from '../../hooks/user_profile';

function ProfileCard() {
  const navigate = useNavigate();
  // 사용자 프로필 훅 (사용자 정보, 스트레칭 누적시간)
  const { userData } = useUserProfile();
  const { usageTime, getStretchingTimeByDate } = useUserStretchingTime();
  
  // 현재 날짜를 YYYY-MM-DD 형식으로 변환
  const currentDate_apiType = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (userData) {
      getStretchingTimeByDate(currentDate_apiType);
    }
  }, [userData]);

  return (
  <div className="relative w-[300px] h-[300px] p-2">
    {/* 배경 이미지 */}
    <img src={profileImg} className="w-[530px] h-[150px] pointer-events-none z-0"/>

    {/* 프로필 카드 */}
    <div className="absolute top-3 left-4 z-10 flex gap-4 p-4 w-full h-[150px] ">
      
      {/* 왼쪽: 프로필 */}
      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/home/userProfile', { state: { userData }} )}>
        {userData? (<img src={userData.profile_url} className="w-[80px] h-[80px] rounded-full object-cover" alt="프로필" />) : <img src={test} className="w-[80px] h-[80px] rounded-full object-cover" alt="프로필" />}
        <div className="flex flex-row items-center mt-1">
          {userData? (<div className="text-[16px] text-[#455970] font-medium pr-1">{userData.username}</div>) : <div className="text-[16px] text-[#455970] font-medium pr-1">로딩중</div>}
          <div className="text-[12px] pt-[2px]">님</div>
        </div>
      </div>

      {/* 오른쪽: 스트레칭 정보 */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-[14px] text-[#969696]">오늘의 스트레칭 시간</div>
        <div className="text-[20px] font-bold">{Math.floor(usageTime / 60)}분 {usageTime % 60}초</div> 
        <div className="bg-gray-300 h-[1px] w-[100px] my-2"></div>
        {userData ? (<div className="text-[12px] text-[#969696] text-center">{userData.introduction}</div>) : <div className="text-[12px] text-[#969696] text-center">로딩중</div>}
      </div>
    </div>
  </div>




  );
}

export default ProfileCard;
