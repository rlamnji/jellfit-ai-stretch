// 친구 검색 컴포넌트
// tailwind css 사용
import { useState } from 'react';
import BackBtn from '../buttons/back_btn';
import SoundBtn from '../buttons/sound_btn';

// 이미지
import background from '../../assets/images/etc/basic_background2.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
import sendBtn from '../../assets/images/icons/friends/friends_send.png';
import cancelBtn from '../../assets/images/icons/friends/friends_cancel2.png';


function FriendSearch({ setSelectedTab }) {

  const [nickname, setNickname] = useState('');

  // 닉네임 검색 후 친구요청 전송
  const handleSendRequest = async () => {
  
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요');
      return;
    }

    // accessToken 가져오기
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다');
      return;
    }

    // (/search)가 부분문자열 검색인듯 한글자라도 맞으면 다 맞다고 나옴
    try {
      // 닉네임 검색
      // 현재 searchRes 응답 : 배열형태
      const searchRes = await fetch(`http://localhost:8000/users/search?nickname=${nickname}`);

      if (searchRes.status === 404) {
        alert(`'${nickname}' 님은 존재하지 않습니다.`);
        return;
      }

      const accessToken = sessionStorage.getItem('accessToken');
      console.log('accessToken:', accessToken);

      if (!searchRes.ok) {
        throw new Error('서버 오류');
      }

      const data = await searchRes.json();

      if (data.length > 0) {
        alert(`'${nickname}' 님은 존재하는 사용자입니다.`);
        console.log('검색 결과:', data);

        // 친구의 user_id 저장
        const receiver_id = data[0].user_id;
        
        // 친구 요청 보내기
        const requestRes = await fetch('http://localhost:8000/friends',{
          method:'POST',
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, 
          },
          body: JSON.stringify({receiver_id}),
        });

        const result = await requestRes.json();
        console.log("친구요청 결과", result);

        if(requestRes.ok){
          alert(`${nickname}님에게 친구 요청을 보냈습니다`);
        }else{
          alert(`요청 실패: ${result.detail || '알 수 없는 오류'}`);
        }

      } else {
        alert(`'${nickname}' 님은 존재하지 않습니다.`);
      }

    } catch (err) {
      console.error('오류:', err);
      alert('오류가 발생했습니다.');
    }
  };


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
