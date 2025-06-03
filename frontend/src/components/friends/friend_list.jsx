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
import { useState, useEffect } from 'react';

function FriendList({ setSelectedTab }) {

  const [friendList, setFriendList] = useState([]);

  // 친구 목록 조회
  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      console.warn("accessToken 없음 — 로그인 필요");
      return;
    }

    fetch("http://localhost:8000/users/friends", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("친구목록 응답:", data);
        const fixed = Array.isArray(data) ? data : [data];
        setFriendList(fixed);
      })
      .catch(err => {
        console.error("친구목록 오류:", err);
      });
  }, []);

  // 친구 삭제 api 호출 추가해야함
  const deleteFriend = (friend_id) =>{
    fetch(`http://localhost:8000/friends/${friend_id}`,{
      method:"DELETE",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("accessToken")
      }
    })
    .then((res)=>{
      if(!res.ok){
        const err = new Error("삭제 실패");
        console.log(err)
      }
      return res.json();
    })
    .then((data)=>{
      alert(data.msg);
      console.log("전",friendList);
      setFriendList(prev => prev.filter(user => user.user_id !== friend_id));
      console.log(friendList);
    })
    .catch((err)=>{
      console.log(err);
    })
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


    <div className='main flex justify-center items-center h-screen bg-slate-200'>
      <div className="flex flex-col items-center justify-center relative w-[70%] h-[70%] text-center z-0 bg-black">
        {/* 상위 타이틀 */}
        <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
        <div className="absolute top-[40px] z-[1] text-[30px] font-bold text-[#522B2B] backdrop-blur-[0.5px] tracking-[4px]">FRIENDS</div>

        
        {/* 스크롤 가능한 유저 전체 박스 */}
        <div className="w-[2800px] h-[500px] mt-[10%] flex flex-col justify-start items-center overflow-y-auto gap-[20px]">
            {friendList.map((friend,i)=>{
              return (
                <div key={i} className=" z-[1] w-full max-w-[1000px] min-h-[150px] flex items-center justify-around px-6 py-4 rounded-xl gap-6 text-[#522B2B]">
                  {/* 유저 이미지 */}
                  <img src={friend.profile_url} className="w-[100px] h-[100px] rounded-full object-cover" />

                  {/* 닉네임 */}
                  <div className="flex flex-col items-start">
                    <div className="text-[14px] opacity-50">닉네임</div>
                    <div className="font-bold text-[18px]">{friend.username}</div>
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
                      {friend.introduction}
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <img src={deleteBtn} className="w-[60px] cursor-pointer" onClick={()=>deleteFriend(friend.user_id)}/>
              </div>
              )
            })}
        </div>
      </div>
    </div>

    </div>
  );
}

export default FriendList;
