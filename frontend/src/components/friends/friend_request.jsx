// 친구 요청 컴포넌트
// tailwind css 사용
import { useNavigate } from 'react-router-dom';

// 이미지
import background from '../../assets/images/etc/basic_background2.png';
import arrow from '../../assets/images/icons/arrow.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
import checkBtn from '../../assets/images/icons/friends/friends_check.png';
import cancelBtn from '../../assets/images/icons/friends/friends_cancel.png';
import testImg from '../../components/home/test.jpg';

function FriendRequest({ setSelectedTab }) {
  const navigate = useNavigate();

  return (
    <div>
      <img
        src={background}
        alt="Background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
      />
      <img src={arrow} className="w-[30px] cursor-pointer m-[10px] z-[1]" onClick={()=>navigate('/home')}/>
  
      <div className="w-[900px] flex justify-start mt-[10px] ml-[150px] relative z-[2]">
          <div className="w-[150px] h-[50px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[20px] text-[#B4B4B4] text-[20px] font-bold text-center items-center justify-center cursor-pointer" onClick={()=>{console.log('친구  눌림'); setSelectedTab('내 친구') }}>내 친구</div>
          <div className="w-[150px] h-[50px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[20px] text-[#B4B4B4] text-[20px] font-bold text-center items-center justify-center cursor-pointer" onClick={()=>{console.log('친구 검색눌림'); setSelectedTab('친구 검색')}}>친구 검색</div>
          <div className="w-[150px] h-[50px] bg-[#552F2F] rounded-[70px] flex mx-[20px] text-white text-[20px] font-bold text-center items-center justify-center cursor-pointer" onClick={()=>{console.log('친구 요청 눌림'); setSelectedTab('요청 목록')}}>요청 목록</div>
      </div>

      
      <div className="relative top-[2vh] w-[1100px] h-[650px] mx-auto flex justify-center text-center z-0">
        <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
        <div className="absolute top-[40px] z-[1] text-[30px] font-bold text-[#522B2B] backdrop-blur-[0.5px] tracking-[4px]">REQUEST LIST</div>

        {/* 스크롤 가능한 유저 전체 박스 */}
        <div className="w-[2800px] h-[500px] mt-[10%] flex flex-col justify-start items-center overflow-y-auto gap-[20px]">
          {/* 유저 박스 1 */}
          <div className="z-[1] w-full max-w-[1000px] min-h-[150px] flex items-center justify-between px-6 py-4 rounded-xl gap-6 text-[#522B2B]">
            <img src={testImg} className="w-[80px] h-[80px] rounded-full object-cover" />
            <div className="flex flex-col items-start">
              <div className="text-[14px] opacity-50">닉네임</div>
              <div className="font-bold text-[18px]">ㄹㅇ유저이름</div>
            </div>
            <img src={checkBtn} className="cursor-pointer w-[60px]"/>
            <img src={cancelBtn} className="cursor-pointer w-[60px]"/>
          </div>

          <div className="z-[1] w-full max-w-[1000px] min-h-[150px] flex items-center justify-between px-6 py-4 rounded-xl gap-6 text-[#522B2B]">
            <img src={testImg} className="w-[80px] h-[80px] rounded-full object-cover" />
            <div className="flex flex-col items-start">
              <div className="text-[14px] opacity-50">닉네임</div>
              <div className="font-bold text-[18px]">ㄹㅇ유저이름</div>
            </div>
            <img src={checkBtn} className="cursor-pointer w-[60px]"/>
            <img src={cancelBtn} className="cursor-pointer w-[60px]"/>
          </div>

          <div className="z-[1] w-full max-w-[1000px] min-h-[150px] flex items-center justify-between px-6 py-4 rounded-xl gap-6 text-[#522B2B]">
            <img src={testImg} className="w-[80px] h-[80px] rounded-full object-cover" />
            <div className="flex flex-col items-start">
              <div className="text-[14px] opacity-50">닉네임</div>
              <div className="font-bold text-[18px]">ㄹㅇ유저이름</div>
            </div>
            <img src={checkBtn} className="cursor-pointer w-[60px]"/>
            <img src={cancelBtn} className="cursor-pointer w-[60px]"/>
          </div>

          <div className="z-[1] w-full max-w-[1000px] min-h-[150px] flex items-center justify-between px-6 py-4 rounded-xl gap-6 text-[#522B2B]">
            <img src={testImg} className="w-[80px] h-[80px] rounded-full object-cover" />
            <div className="flex flex-col items-start">
              <div className="text-[14px] opacity-50">닉네임</div>
              <div className="font-bold text-[18px]">ㄹㅇ유저이름</div>
            </div>
            <img src={checkBtn} className="cursor-pointer w-[60px]"/>
            <img src={cancelBtn} className="cursor-pointer w-[60px]"/>
          </div>

        </div>


      </div>
      
    </div>
  );
}

export default FriendRequest;
