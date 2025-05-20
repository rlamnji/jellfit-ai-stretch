// 프로필 컴포넌트
// tailwind css 사용
import profileImg from '../../../assets/images/icons/home/profile_user.png';
import test from '../../../assets/images/test.jpg'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProfileCard() {

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  useEffect(()=>{
    // 사용자 정보 조회
    fetch("http://127.0.0.1:8000/get/me",{
      method: "GET",
      headers:{
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
      }
    })
    .then( res =>{
      if(!res.ok){
        throw new Error("네트워크 오류")
      }
      return res.json();
    })
    .then(data =>{
      console.log(data);
      setUserData(data);
    })
    .catch(err => {
      console.error("에러 발생:", err);
    });

  },[])


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
        <div className="text-[20px] font-bold">12m 32s</div>
        <div className="bg-gray-300 h-[1px] w-[100px] my-2"></div>
        {userData ? (<div className="text-[12px] text-[#969696] text-center">{userData.introduction}</div>) : <div className="text-[12px] text-[#969696] text-center">로딩중</div>}
      </div>
    </div>
  </div>




  );
}

export default ProfileCard;
