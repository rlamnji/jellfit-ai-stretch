// 도감 페이지
// tailwindcss 사용
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 컴포넌트
import BackBtn from '../../common/components/back_btn';
import SoundBtn from '../../common/components/sound_btn';
// 이미지/에셋
import collectBox from '../../assets/images/icons/home/collect_box.png';
import collectBook from '../../assets/images/icons/home/collect_book.png';
import collectCancel from '../../assets/images/icons/home/collect_cancel.png';
import backgroundImg from '../../assets/images/etc/basic_background2.png';

// 커스텀 훅
import { useCollection } from '../hooks/use_collection';

function CollectPage() {

   const navigate = useNavigate();

   const {
      characterMap,
      characterUserGetMap,
      selectedCharacterId,
      setSelectedCharacterId,
      fullCharacter,
      isUnlocked,
      poseName,
      userCnt,
      selectCharacter,
   } = useCollection();


   // 그리드에 캐릭터 번호 매핑 (캐릭터 자리 지정)
   const gridCharacterMap = [
      1,  2,  3,  4,  5,
      6,  7,  8,  9, 10,
      11, 12, 13, 14, 15,
      16, 17, 18, 19, 20,
      21, 22, 23, 24, 25,
      26, 27, 28, 29, 30,
      31, 32, 33, 34, 35,
      36, 37, 38, 39, 40,
      41, 42, 43, 44, 45,
      46, 47, 48, 49, 50
   ];

   const handleClick=(character_id)=>{
      console.log("캐릭터 번호", character_id);
      setSelectedCharacterId(character_id)
   }

    return (
      <div className='relative w-screen h-screen overflow-hidden'>
          <img
            src={backgroundImg}
            alt="Background"
            className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
         />
         
         <div className='flex flex-row justify-between'>
            <BackBtn/>
            <SoundBtn/>
         </div>

         <div className="relative flex flex-col items-center justify-center translate-y-[-1vh]">


         <div className="relative flex justify-center items-center w-[83%] animate-[moveing_2s_ease-in-out_infinite]">
            {/* 배경 책 이미지 */}
            <img src={collectBook} className="w-full" />

            {/* 닫기 버튼 */}
            <img
               src={collectCancel}
               className="absolute top-[14%] right-[12%] translate-x-1/2 -translate-y-1/2 w-[5vw] cursor-pointer"
               onClick={() => navigate('/home')}
            />

            {/* 왼쪽 콘텐츠 */}
            {/* 빈그리드 클릭 시, 해파리 있는 그리드 클릭 시 */}
            <div>
               {selectedCharacterId && (
                  <div>
                     {isUnlocked ? 
                     <img src={fullCharacter?.image_url} className='absolute top-[23.5%] left-[22%] w-[14%] h-[20%] object-contain'></img> :             
                     
                     <div className="absolute top-[23.5%] left-[18%] w-[23%] h-[20%] bg-[#E5E5E5] opacity-80 rounded-xl border-2 flex items-center justify-center">
                        <div className='flex flex-col items-center justify-center'>
                           <div className="text-[15px] text-[#585050] mb-4"> <span className='text-[20px] font-bold'>{fullCharacter.acquisition_num - userCnt} 번만</span> 더 하면 얻을 수 있어요!</div>
                           <div className="text-[13px] text-[#585050]"> * 현재 진행 횟수: {userCnt} / {fullCharacter.acquisition_num}</div>
                        </div>
                     </div>
                     }
                  </div>
               )}
            </div>

            {/* 사용자 획득 테이블에 있으면 정보 출력 아니면 ??? 또는 해당 character_id에 맞는 정보 출력 */}
            <div className="absolute top-[53%] left-[15%] text-[#513030] text-[1.5vw] font-bold blur-[0.5px]">
               {selectedCharacterId && (
                  <span>{isUnlocked ? fullCharacter?.name : "???"}</span>
               )}
            </div>
            <div className="absolute top-[63%] left-[15%] w-[28%] h-[11%] text-[#513030] text-[1.2vw] blur-[0.5px] overflow-y-auto break-words whitespace-normal">
                {selectedCharacterId && (
                  <span>{isUnlocked ? fullCharacter?.description : "???"}</span>
               )}
            </div>
            <div className="absolute top-[79%] left-[15%] w-[28%] h-[15%] text-[#513030] text-[1.2vw] blur-[0.5px] overflow-y-auto break-words whitespace-normal">
               {selectedCharacterId && (
               <span>{isUnlocked ?  poseName: poseName}</span>
               )}
            </div>

            {/* 오른쪽 도감 박스 */}
            <div className="absolute top-[20%] left-[52%] w-[37%] h-[66%] overflow-y-auto grid grid-cols-4 gap-4 p-4 auto-rows-auto">
               {gridCharacterMap.map((characterId, i) => {
               const isUnlocked = characterUserGetMap.some(c => c.character_id === characterId);
               const fullCharacter = characterMap.find(c => c.character_id === characterId);

               return (
                  <div key={i} className="relative w-full h-full">
                     <img
                     src={collectBox}
                     onClick={() => handleClick(characterId)}
                     className="w-full object-contain cursor-pointer"
                     />

                     {isUnlocked && fullCharacter && (
                     <img
                        src={fullCharacter.image_url}
                        className="absolute top-1/2 left-1/2 w-4/5 h-4/5 object-contain -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                     />
                     )}
                  </div>
               );
               })}
            </div>
         </div>
         </div>
      </div>
    );
  }
  
  export default CollectPage;
  