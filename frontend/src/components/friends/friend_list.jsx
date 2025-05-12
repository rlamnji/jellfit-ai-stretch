// 친구 목록 컴포넌트
// tailwindcss 사용
import { useNavigate } from 'react-router-dom';
import BackBtn from '../buttons/back_btn';
import SoundBtn from '../buttons/sound_btn';

// 이미지
import background from '../../assets/images/etc/basic_background2.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
import workLog from '../../assets/images/icons/friends/friends_log.png';
import deleteBtn from '../../assets/images/icons/friends/friends_delete.png';
import testImg from '../../assets/images/test.jpg'

function FriendList({ setSelectedTab }) {

  return (
    <div>
      <img
        src={background}
        alt="Background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
      />
      
      <div className='flex flex-row justify-between'>
        <BackBtn/>
        <SoundBtn/>
      </div>



      <div className="w-full flex justify-center mt-[10px] relative z-[2]">
        <div className="flex">
          <div
            className="w-[150px] h-[50px] bg-[#552F2F] rounded-[70px] flex mx-[20px] text-white text-[20px] font-bold text-center items-center justify-center cursor-pointer"
            onClick={() => {
              console.log('친구 눌림');
              setSelectedTab('내 친구');
            }}
          >
            내 친구
          </div>
          <div
            className="w-[150px] h-[50px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[20px] text-[#B4B4B4] text-[20px] font-bold text-center items-center justify-center cursor-pointer"
            onClick={() => {
              console.log('친구 검색 눌림');
              setSelectedTab('친구 검색');
            }}
          >
            친구 검색
          </div>
          <div
            className="w-[150px] h-[50px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[20px] text-[#B4B4B4] text-[20px] font-bold text-center items-center justify-center cursor-pointer"
            onClick={() => {
              console.log('요청 목록 눌림');
              setSelectedTab('요청 목록');
            }}
          >
            요청 목록
          </div>
        </div>
      </div>


      <div className="relative top-[2vh] w-[1100px] h-[650px] mx-auto flex justify-center text-center z-0">
        {/* 상위 타이틀 */}
        <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
        <div className="absolute top-[40px] z-[1] text-[30px] font-bold text-[#522B2B] backdrop-blur-[0.5px] tracking-[4px]">FRIENDS</div>

        
        {/* 스크롤 가능한 유저 전체 박스 */}
        <div className="w-[2800px] h-[500px] mt-[10%] flex flex-col justify-start items-center overflow-y-auto gap-[20px]">
          
        <div className=" z-[1] w-full max-w-[1000px] min-h-[150px] flex items-center justify-around px-6 py-4 rounded-xl gap-6 text-[#522B2B]">
            {/* 유저 이미지 */}
            <img src={testImg} className="w-[100px] h-[100px] rounded-full object-cover" />

            {/* 닉네임 */}
            <div className="flex flex-col items-start">
              <div className="text-[14px] opacity-50">닉네임</div>
              <div className="font-bold text-[18px]">ㄹㅇ유저이름</div>
            </div>

            {/* 운동기록 */}
            <div className="flex flex-col items-center">
              <div className="text-[14px] opacity-50 mb-1">운동기록</div>
              <img src={workLog} className="w-[80px] cursor-pointer" />
            </div>

            {/* 한줄소개 */}
            <div className="flex flex-col items-center w-[250px] max-h-[100px] overflow-y-auto">
              <div className="text-[14px] opacity-50 mb-1">한줄소개</div>
              <div className="text-[16px] text-[#7E6161] break-words text-center">
                한줄소개입니다
              </div>
            </div>

            {/* 삭제 버튼 */}
            <img src={deleteBtn} className="w-[60px] cursor-pointer" />
          </div>

          
        </div>

        

      </div>
  
    </div>
  );
}

export default FriendList;
