// 친구 검색 컴포넌트
// tailwind css 사용
import { useState } from 'react';
import BackBtn from '../buttons/back_btn';
import SoundBtn from '../buttons/sound_btn';
// import axios from 'axios';

// 이미지
import background from '../../assets/images/etc/basic_background2.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
import sendBtn from '../../assets/images/icons/friends/friends_send.png';
import cancelBtn from '../../assets/images/icons/friends/friends_cancel2.png';


function FriendSearch({ setSelectedTab }) {

  const [nickname, setNickname] = useState('');

  // 친구 요청 전송
  const handleSendRequest = () => {

    if (!nickname.trim()) {
      alert('닉네임을 입력하세요');
      return;
    }

    /*axios.post('/api/friends/request', {
      requester_id: 110,       // 사용자 번호
      nickname: 'nickname'       // 상대 닉네임
    })
    .then(res => alert(res.data.message))
    .catch(err => console.error(err));*/

    console.log('친구 이름 ', nickname);
  }


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
            className="w-[150px] h-[50px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[20px] text-[#B4B4B4] text-[20px] font-bold text-center items-center justify-center cursor-pointer"
            onClick={() => {
              console.log('친구 눌림');
              setSelectedTab('내 친구');
            }}
          >
            내 친구
          </div>
          <div
            className="w-[150px] h-[50px] bg-[#552F2F] rounded-[70px] flex mx-[20px] text-white text-[20px] font-bold text-center items-center justify-center cursor-pointer"
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
        <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
        <div className="absolute top-[40px] z-[1] text-[30px] font-bold text-[#522B2B] backdrop-blur-[0.5px] tracking-[4px]">REQUEST</div>

        <div className="flex flex-col items-center justify-center">
          
          {/* 타이틀 */}
          <div className=" text-[40px] text-[#522B2B] mt-14 z-[1] opacity-100 text-center font-bold ">
            친구 요청을 보내시겠습니까?
          </div>

          {/* 닉네임 입력 */}
          <div className="flex flex-row items-center space-x-4 z-[1] p-10 h-[300px] ">
            <div className='text-[30px] text-[#522B2B] font-semibold pr-10 '>닉네임</div>
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              className="text-[30px] h-[100px] w-[500px] px-20 py-10 border bg-white opacity-30 rounded-full"
              value = {nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-row space-x-10 z-[1]  justify-between items-end">
            <img src={sendBtn} className="w-[150px] h-[60px] cursor-pointer" onClick={()=>handleSendRequest()}/>
            <img src={cancelBtn} className="w-[150px] h-[60px] cursor-pointer" onClick={()=>setNickname('')}/>
          </div>
        </div>


      </div>
    </div>


  );
}

export default FriendSearch;
