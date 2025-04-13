// 프로필 컴포넌트
// tailwind css 사용
// 수정필요 (커서 안먹음, 한줄소개 스크롤 안됨)
import styles from '../../styles/components/profile.module.css';
import profileImg from '../../../src/assets/images/icons/home/profile_user.png';
import test from './test.jpg';
import { useNavigate } from 'react-router-dom';

function ProfileCard() {

  const navigate = useNavigate();

  return (
  <div className="relative top-10 left-10">  

    <img src={profileImg} className="w-[1200px] z-0 pointer-events-none" />
    <div className="absolute z-10 top-14 left-20 w-[1000px] flex flex-row items-center justify-evenly">
      
      <div className="flex flex-col justify-center items-center bg-slate-400 w-[300px] h-[350px] cursor-pointer" onClick={() => navigate('/home/friends')}>
        <img src={test} className="w-[200px] rounded-full" alt="프로필" />
        <div className="flex flex-row pt-4 items-center cursor-pointer">
          <div className="text-[70px] z-10 text-[#455970] pr-3 font-medium bg-red-100 cursor-pointer">닉네임</div>
          <div className="text-[50px] pt-3">님</div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center bg-slate-600 w-[600px]">
        <div className="text-[60px] text-[#969696]">오늘의 스트레칭 시간</div>
        <div className="text-[100px] font-bold">12m 32s</div>
        <div className="bg-gray-300 h-[2px] w-[500px] my-4"></div>
        <div className="text-[60px] text-[#969696] bg-black w-[500px] z-20 pointer-events-auto ">
          한줄소개입니다.
        </div>
      </div>
    </div>
  </div>


  );
}

export default ProfileCard;
