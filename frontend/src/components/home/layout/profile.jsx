// 프로필 컴포넌트
// tailwind css 사용
import profileImg from '../../../assets/images/icons/home/profile_user.png';
import test from '../../../assets/images/test.jpg'
import { useNavigate } from 'react-router-dom';

function ProfileCard() {

  const navigate = useNavigate();

  //
  //fetch()

  return (
  <div className="relative w-[300px] h-[300px] p-2">
    {/* 배경 이미지 */}
    <img src={profileImg} className="w-[530px] h-[150px] pointer-events-none z-0"/>

    {/* 프로필 카드 */}
    <div className="absolute top-3 left-4 z-10 flex gap-4 p-4 w-full h-[150px] ">
      
      {/* 왼쪽: 프로필 */}
      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/home/userProfile')}>
        <img src={test} className="w-[80px] h-[80px] rounded-full object-cover" alt="프로필" />
        <div className="flex flex-row items-center mt-1">
          <div className="text-[16px] text-[#455970] font-medium pr-1">닉네임</div>
          <div className="text-[12px] pt-[2px]">님</div>
        </div>
      </div>

      {/* 오른쪽: 스트레칭 정보 */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-[14px] text-[#969696]">오늘의 스트레칭 시간</div>
        <div className="text-[20px] font-bold">12m 32s</div>
        <div className="bg-gray-300 h-[1px] w-[100px] my-2"></div>
        <div className="text-[12px] text-[#969696] text-center">한줄소개입니다.</div>
      </div>
    </div>
  </div>




  );
}

export default ProfileCard;
