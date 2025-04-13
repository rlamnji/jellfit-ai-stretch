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
        style={{
          position: 'fixed',          
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',     
          zIndex: -1
        }}
      />
      <img src={arrow} className="w-[100px] cursor-pointer m-[60px] z-[1]" onClick={()=>navigate('/home')}/>
  
      <div className="w-full flex justify-start mt-[10px] ml-[900px] relative z-[2]">
          <div className="w-[500px] h-[200px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[40px] text-[#B4B4B4] text-[80px] font-bold text-center items-center justify-center cursor-pointer blur-[2px]" onClick={()=>{console.log('친구  눌림'); setSelectedTab('내 친구') }}>내 친구</div>
          <div className="w-[500px] h-[200px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[40px] text-[#B4B4B4] text-[80px] font-bold text-center items-center justify-center cursor-pointer blur-[2px]" onClick={()=>{console.log('친구 검색눌림'); setSelectedTab('친구 검색')}}>친구 검색</div>
          <div className="w-[500px] h-[200px] bg-[#552F2F] rounded-[70px] flex mx-[40px] text-white text-[80px] font-bold text-center items-center justify-center cursor-pointer blur-[2px]" onClick={()=>{console.log('친구 요청 눌림'); setSelectedTab('요청 목록')}}>요청 목록</div>
      </div>

      
      <div className="relative top-[2vh] w-[4000px] h-[2500px] mx-auto flex justify-center text-center z-0">
        <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
        <div className="absolute top-[150px] z-[1] text-[130px] font-bold text-[#522B2B] backdrop-blur-[0.5px] tracking-[4px]">REQUEST LIST</div>

        {/* 스크롤 가능한 유저 전체 박스 */}
        <div className="w-[3500px] h-[1800px] mt-[13%] flex flex-col justify-start items-center overflow-y-auto gap-[20px]">
          {/* 유저 박스 1 */}
          <div className="z-[1] w-[3000px] h-[1500px] flex justify-between items-center text-center mb-[150px] text-[#522B2B] backdrop-blur-[0.5px]">
            <img src={testImg} className="bg-black w-[15%] aspect-square rounded-full"/>
            <div className="pr-[120px]">
              <div className="text-[70px] opacity-50 justify-center text-center pb-[40px] blur-[2px]">닉네임</div>
              <div className="font-bold text-center text-[90px] blur-[2px]">ㄹㅇ유저이름</div>
            </div>
            <img src={checkBtn} className="cursor-pointer w-[300px]"/>
            <img src={cancelBtn} className="cursor-pointer w-[300px]"/>
          </div>

          {/* 유저 박스 2 */}
          <div className="z-[1] w-[3000px] h-[1500px] flex justify-between items-center text-center mb-[150px] text-[#522B2B] backdrop-blur-[0.5px]">
            <img src={testImg} className="bg-black w-[15%] aspect-square rounded-full"/>
            <div className="pr-[120px]">
              <div className="text-[70px] opacity-50 justify-center text-center pb-[40px] blur-[2px]">닉네임</div>
              <div className="font-bold text-center text-[90px] blur-[2px]">ㄹㅇ유저이름</div>
            </div>
            <img src={checkBtn} className="cursor-pointer w-[300px]"/>
            <img src={cancelBtn} className="cursor-pointer w-[300px]"/>
          </div>

          {/* 유저 박스 3 */}
          <div className="z-[1] w-[3000px] h-[1500px] flex justify-between items-center text-center mb-[150px] text-[#522B2B] backdrop-blur-[0.5px]">
            <img src={testImg} className="bg-black w-[15%] aspect-square rounded-full"/>
            <div className="pr-[120px]">
              <div className="text-[70px] opacity-50 justify-center text-center pb-[40px] blur-[2px]">닉네임</div>
              <div className="font-bold text-center text-[90px] blur-[2px]">ㄹㅇ유저이름</div>
            </div>
            <img src={checkBtn} className="cursor-pointer w-[300px]"/>
            <img src={cancelBtn} className="cursor-pointer w-[300px]"/>
          </div>

        </div>


      </div>
      
    </div>
  );
}

export default FriendRequest;
