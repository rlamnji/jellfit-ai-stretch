// 친구, 도감, 운동일지 컴포넌트
// tailwind css 사용
import { useNavigate } from 'react-router-dom';

import friends from '../../../assets/images/icons/home/home_friends.png';
import collections from '../../../assets/images/icons/home/home_collect.png';
import exercise from '../../../assets/images/icons/home/home_exercise.png';

function DashBoard() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between pl-8 pt-10 ">
      <div className="flex flex-col gap-[3vw]">
        <img className="w-[200px] cursor-pointer animate-[moveing_3s_ease-in-out_infinite] transition-transform duration-200 hover:animate-none hover:-translate-y-[5px] hover:scale-[1.02]" src= {friends} onClick={()=>navigate('/home/friends')}/>
        <img className="w-[200px] cursor-pointer animate-[moveing_3s_ease-in-out_infinite] transition-transform duration-200 hover:animate-none hover:-translate-y-[5px] hover:scale-[1.02]" src= {collections} onClick={()=>navigate('/home/collection')}/>
        <img className="w-[200px] cursor-pointer animate-[moveing_3s_ease-in-out_infinite] transition-transform duration-200 hover:animate-none hover:-translate-y-[5px] hover:scale-[1.02]" src= {exercise} />          
      </div>
      
    </div>
  );
}

export default DashBoard;
