// 자율모드, 가이드모드 시작 버튼
// tailwindcss 사용
import { useState } from 'react';
import { Link } from 'react-router-dom';
import backModeBtn from '../../assets/images/icons/home/background_mode.png';
import guideModeBtn from '../../assets/images/icons/home/guide_mode.png';

function StartButton() {

  const [hovered, setHovered] = useState(null)


  return (
    <div className="flex justify-center items-center content-between mb-10 mr-20 relative">
        <div onMouseEnter={()=>setHovered('background')} onMouseLeave={()=>setHovered(null)} className='relative'>

          {/* 말풍선 창 */}
          {hovered=='background' &&(
            <div
            className={`absolute bottom-[120%] left-[30%] -translate-x-1/2 bg-[#585858] p-4 w-[220px] text-sm text-white text-center rounded transition-all duration-300 
              ${hovered === "background" ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}>
              <strong className="text-[20px]">백그라운드</strong>로 실행하면서<br></br>자세 알림을 해주어요!
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
                        border-l-8 border-l-transparent 
                        border-r-8 border-r-transparent 
                        border-t-8 border-t-[#585858]"></div>
            </div>
          )}

          {/* 자세교정 모드 아이콘(백그라운드) */}
          <img src={backModeBtn} className=" w-[150px] mt-4 mr-20 transition-transform duration-200 animate-[moveing_3s_ease-in-out_infinite] cursor-pointer hover:animate-none hover:-translate-y-[5px] hover:scale-[1.02]" alt="자율모드" />
        </div>


        <div onMouseEnter={()=>setHovered('guide')} onMouseLeave={()=>setHovered(null)} className='relative'>

          {/* 말풍선 창 */}
            {hovered=='guide'&&(
            <div
            className={`absolute bottom-[120%] left-1/2 -translate-x-1/2 bg-[#585858] p-4 w-[220px] text-sm text-white text-center rounded transition-all duration-300 
              ${hovered === "guide" ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}>
                스트레칭 가이드를 따라하면서<br></br><strong class="text-[20px]">직접</strong>해볼 수 있어요 !
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
                    border-l-8 border-l-transparent 
                    border-r-8 border-r-transparent 
                    border-t-8 border-t-[#585858]"></div>
              </div>
            )}

          {/* 가이드모드 아이콘 */}
          <Link to="/guide/select">
            <img src={guideModeBtn} className="flex items-end w-[150px] mt-4  transition-transform duration-200 animate-[moveingCopy_3s_ease-in-out_infinite] cursor-pointer hover:animate-none hover:-translate-y-[5px] hover:scale-[1.02]" alt="가이드모드" />
          </Link>
        </div>

    </div>
  );
}

export default StartButton;
