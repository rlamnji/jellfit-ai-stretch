// 친구 요청 컴포넌트
// tailwind css 사용
import { useEffect, useState } from 'react';
//import axios from 'axios';
import BackBtn from '../buttons/back_btn';
import SoundBtn from '../buttons/sound_btn';

// 이미지
import background from '../../assets/images/etc/basic_background2.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
import checkBtn from '../../assets/images/icons/friends/friends_check.png';
import cancelBtn from '../../assets/images/icons/friends/friends_cancel.png';
import testImg from '../../assets/images/test.jpg'

function FriendRequest({ setSelectedTab }) {

  const [requestList, setRequestList] = useState([]);

  // 요청 목록 불러오기
  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');

    fetch('http://localhost:8000/friends/requests',{
      method:'GET',
      headers:{
        'Authorization': `Bearer ${accessToken}`,
      },
    })

      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setRequestList(data);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });
  }, []);


  // 수락
  const handleAccept = (requesterId) =>{
    const accessToken = sessionStorage.getItem("accessToken");
    
    fetch('http://localhost:8000/friends/accept',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ requester_id: requesterId })
    })
    .then((data)=>{
      console.log(data.message);
      setRequestList(prev => prev.filter(user => user.user_id !== requesterId));
    })
    .catch((error) => {
      console.error('친구 요청 수락 중 오류:', error);
    });
  
  };


  // 거절
  const handleReject = (requesterId) =>{

    const accessToken = sessionStorage.getItem("accessToken");
    fetch('http://localhost:8000/friends/reject',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ requester_id: requesterId })
    })
    .then((data)=>{
      console.log(data.message);
      setRequestList(prev => prev.filter(user => user.user_id !== requesterId));
    })
    .catch((error) => {
      console.error('친구 요청 거절 중 오류:', error);
    });
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
            className="w-[150px] h-[50px] bg-[#FFF1D5] opacity-50 rounded-[70px] flex mx-[20px] text-[#B4B4B4] text-[20px] font-bold text-center items-center justify-center cursor-pointer"
            onClick={() => {
              console.log('친구 검색 눌림');
              setSelectedTab('친구 검색');
            }}
          >
            친구 검색
          </div>
          <div
            className="w-[150px] h-[50px] bg-[#552F2F] rounded-[70px] flex mx-[20px] text-white text-[20px] font-bold text-center items-center justify-center cursor-pointer"
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
        <div className="absolute top-[40px] z-[1] text-[30px] font-bold text-[#522B2B] backdrop-blur-[0.5px] tracking-[4px]">REQUEST LIST</div>

        {/* 스크롤 가능한 유저 전체 박스 */}
        <div className="w-[2800px] h-[500px] mt-[10%] flex flex-col justify-start items-center  overflow-y-auto gap-[20px]">
          {/* 유저 박스 1 */}
            {requestList.map((user, index) => {
              return (
                <div key={index} className="z-[1] w-full max-w-[1000px] min-h-[150px] flex items-center justify-around px-6 py-4 rounded-xl gap-6 text-[#522B2B]">
                  <img src={testImg} className="w-[100px] h-[100px] rounded-full object-cover" />
                  <div className="flex flex-col items-start ml-28 mr-44">
                    <div className="text-[20px] opacity-50">닉네임</div>
                    <div className="font-bold text-[24px]">{user.username}</div>
                  </div>
                  <img src={checkBtn} className="cursor-pointer w-[50px]" onClick={() => handleAccept(user.user_id)} />
                  <img src={cancelBtn} className="cursor-pointer w-[50px]" onClick={() => handleReject(user.user_id)} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default FriendRequest;
