// 도감 페이지
// tailwindcss 사용
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 컴포넌트
import BackBtn from '../../../components/buttons/back_btn';
import SoundBtn from '../../../components/buttons/sound_btn';
// 이미지
import collectBox from '../../../assets/images/icons/home/collect_box.png';
import collectBook from '../../../assets/images/icons/home/collect_book.png';
import collectCancel from '../../../assets/images/icons/home/collect_cancel.png';
import backgroundImg from '../../../assets/images/etc/basic_background2.png';

function CollectPage() {

   const navigate = useNavigate();
   
   const [characterMap, setCharacterMap] = useState([]); // 전체 캐릭터
   const [characterUserGetMap, setCharacterUserGetMap] = useState([]); // 사용자가 가진 캐릭터 id
   const [selectedCharacterId, setSelectedCharacterId] = useState(null);  // 현재 선택된 id 번호
   
   const [poseId, setPoseId] = useState(null); // pose_id 저장용
   const [poseName, setPoseName] = useState(null); // 스트레칭 이름 저장용
   const [userCnt, setUserCnt] = useState(null); // 스트레칭 누적 횟수 저장용

   // selectedCharacterId를 기반으로 전체 캐릭터 리스트에서 해당 캐릭터 정보 찾기
   const fullCharacter = characterMap.find(c => c.character_id === selectedCharacterId);
   // characterUserGetMap에 선택된 캐릭터 ID가 있는지 여부 (획득 여부 판단)
   const isUnlocked = characterUserGetMap.some(c => c.character_id === selectedCharacterId);

   // 최초 렌더링 시 전체 캐릭터와 내 캐릭터 조회 api
   useEffect(() => {
   const fetchData = async () => {
      try {
         const token = sessionStorage.getItem("accessToken"); 
         console.log("토큰" ,token)

         const [allRes, userRes/*,stretchRes*/] = await Promise.all([
         fetch("http://localhost:8000/characters"),
         fetch("http://localhost:8000/characters/my-characters", {
            headers: {
               Authorization: `Bearer ${token}`,
            }
         }),
         ]);

         if (!allRes.ok || !userRes.ok) {
            console.error("인증 실패 또는 서버 오류");
            return;
         }

         const allData = await allRes.json();
         const userData = await userRes.json();

         setCharacterMap(allData);
         setCharacterUserGetMap(userData);
      } catch (err) {
         console.log("API 호출 오류", err);
      }
   };

   fetchData();
   }, []);

   console.log("보유",characterUserGetMap);


   // pose_id에 맞는 스트레칭 이름 가져오는 api
   useEffect(() => {
      if (!selectedCharacterId) return;
      const selected = characterMap.find(c => c.character_id === selectedCharacterId); // 내가 선택한 id랑 캐릭터 id 일치하는 게 있는지
      if (selected) {
         setPoseId(selected.pose_id);
      }
   }, [selectedCharacterId, characterMap]);

   useEffect(() => {
      const fetchData = async () =>{
         try{
            if (!poseId) return; // poseId가 없으면 실행하지 않음

            const [nameRes, cntRes] = await Promise.all([
               fetch(`http://localhost:8000/guide/stretching/${poseId}`),
               fetch(`http://localhost:8000/user/repeat-count/${poseId}`)
            ]);

            if (!nameRes.ok || !cntRes.ok /*|| !stretchRes.ok*/) {
               console.error("인증 실패 또는 서버 오류");
               return;
            }

            // 자세 이름
            const nameData = await nameRes.json();
            setPoseName(nameData.name);

            // 사용자 누적 횟수
            const cntData = await cntRes.json();
            setUserCnt(cntData.repeat_cnt);

         } catch(err){
            console(err);
         }
      }

      fetchData();
   }, [poseId]);


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
  