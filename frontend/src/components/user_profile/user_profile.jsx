// 상세프로필 수정 (상단 프로필 확인)
// 이미지
import friendsContent from '../../assets/images/icons/detail_user_content.png';
import ProfileModal from './user_profile_modal';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function UserProfile(){
    const [modal, setOpenModal] = useState(false);

    const location = useLocation();
    const [userData, setUserData] = useState(location.state?.userData || {});

    const handleUpdateUser = (updatedUser) => {
        setUserData(updatedUser); // 갱신
        setOpenModal(false); 
    };

    useEffect(() => {
        if (modal === false && userData) {
            // userData가 바뀌면 리렌더링
            console.log("프로필이 갱신되었습니다:", userData);
        }
    }, [modal, userData]);

    const handleLogout = () => {
        /*axios.post('/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }).then(() => {
            // 토큰 삭제 후 페이지 이동
            localStorage.removeItem('token');
            navigate('/login');
          });*/

          console.log('로그아웃 버튼 클릭');
    }

    return (
       
            <div className='relative top-[8vh] w-[1100px] h-[650px] flex justify-start'>
               <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
            
                {/* 프로필(상단) */}
                <div className='absolute flex flex-row  items-center w-full  text-center'>
                    <div className='flex flex-row items-center ml-11 mr-10 mt-9'>
                        <img src={userData?.profile_url} className='w-[150px] h-[150px] rounded-full object-cover' />

                        <div className='flex flex-col text-start pl-8'>
                        <div className='flex flex-row items-center gap-6'>
                            <div className='text-[35px] text-[#522B2B] font-bold'>{userData?.username}</div>
                            
                        </div>

                        <div className='text-[22px] text-[#7E6161]'>{userData?.id}</div>
                        <div className='text-[24px] text-[#7E6161]'>{userData?.introduction}</div>
                        </div>
                    </div>

                    {/* 프로필 수정 버튼 */}
                    <div className="ml-[430px] h-[90px]">
                        <div className='flex justify-end text-[15px] text-[#552F2F] underline pb-8 cursor-pointer' onClick={()=>handleLogout()}>로그아웃</div>
                        <div className='flex w-[200px] h-[50px] bg-[#552F2F] rounded-2xl justify-center items-center cursor-pointer'  onClick={()=>{setOpenModal(true)}}>
                            <div className='text-[20px] text-white text-center'>프로필 수정</div>
                        </div>
                        {modal && <ProfileModal data={userData} onClose={() => setOpenModal(false)}  onUpdate={handleUpdateUser}/>}
                    </div>
                    </div>


            </div>
        
        
        
    );
}

export default UserProfile;