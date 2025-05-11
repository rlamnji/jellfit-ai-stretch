// 친구 검색 컴포넌트
// tailwind css 사용
import { useState } from 'react';
import BackBtn from '../buttons/back_btn';
import SoundBtn from '../buttons/sound_btn';
import axios from 'axios';

// 이미지
import background from '../../assets/images/etc/basic_background2.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
import sendBtn from '../../assets/images/icons/friends/friends_send.png';
import cancelBtn from '../../assets/images/icons/friends/friends_cancel2.png';


function FriendSearch({ setSelectedTab }) {

  const [nickname, setNickname] = useState('');

  // 예시 데이터
  const user = [
    {
      user_num : 1,
      name : '해파리',
      info : '한줄소개 테스트'
    },
    {
      user_num : 2,
      name : '친구임',
      info : '테스트테스트'
    },
  ];

  // 친구 요청 전송
  // 해당 사용자가 존재 하는 지 여부 검사 후
  // 친구 테이블에 등록 (Post) 수락여부 none인 상태로
  // 내 닉네임 검색했을 땐?
  // 중복 요청 했을 땐?
  const handleSendRequest = async () => {

    // 요청한 닉네임이 존재하는 사용자 인지
    const isHaved = user.some(c => c.name === nickname);

    if (!nickname.trim()) {
      alert('닉네임을 입력하세요');
      return;
    }

    if(isHaved){
      alert("존재하는 사용자입니다");
      console.log('친구 이름 ', nickname);
    }else{
      alert("존재하지 않는 사용자임!!")
    }

    /*try{
      // 닉네임으로 사용자 검색
      const searchRes = await axios.get(`users/search?nickname=${nickname}`);
      // 친구의 사용자.번호 저장
      const receiver_id = searchRes.data.user_id;

      // 친구 요청 보내기
      await axios.post('/friends', {
        requester_id: 110,       // (나) 사용자 번호
        receiver_id: receiver_id, // (친구) 사용자 번호
        status: 'none' // 수락 여부
      });

      alert(`${nickname}님에게 친구 요청을 보냈습니다`);

    }catch (err){
      if (err.response?.status === 404) {
        alert('존재하지 않는 사용자입니다');
      } else {
        console.error('친구 요청 오류', err);
        alert('요청 중 오류가 발생했습니다');
      }
    }*/

    
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
