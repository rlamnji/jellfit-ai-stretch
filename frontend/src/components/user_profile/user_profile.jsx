// 상세프로필 수정 (상단 프로필 확인)
// 이미지
import friendsContent from '../../assets/images/icons/detail_user_content.png';
import ProfileModal from './user_profile_modal';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function UserProfile(){
    const navigate = useNavigate();
    const [modal, setOpenModal] = useState(false);
    const location = useLocation();
    const [userData, setUserData] = useState(location.state?.userData || {});

    const handleLogout = () => {

        const accessToken = sessionStorage.getItem("accessToken");

        fetch('http://127.0.0.1:8000/auth/logout', {
            method:"POST",
            headers:{
                'Authorization': `Bearer ${accessToken}`
            },
        })
        .then(res =>{
            if(res.ok){
                sessionStorage.removeItem('token');
                navigate('/login');
            } else {
                console.error("로그아웃 실패 ", res.statusText);
            }
        })
        .catch(err =>{
            console.log(err);
        });
    }

    return (
       
            <div className='relative top-[8vh] w-[1100px] h-[650px] flex justify-start'>
               <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
            
                {/* 프로필(상단) */}
                <div className='absolute flex flex-row  items-center  text-center'>
                    <div className='flex flex-row items-center ml-11 mr-10 mt-10 w-[680px] '>
                        <img src={userData?.profile_url} className='w-[140px] h-[140px] rounded-full object-cover' />

                        <div className='flex flex-col text-start pl-8'>
                        <div className='flex flex-row items-center gap-6'>
                            <div className='text-[35px] text-[#522B2B] font-bold'>{userData?.username}</div>
                            
                        </div>

                        <div className='text-[22px] text-[#7E6161]'>{userData?.id}</div>
                        <div className='text-[24px] text-[#7E6161]'>{userData?.introduction}</div>
                        </div>
                    </div>

                    {/* 프로필 수정 버튼 */}
                    <div className="ml-[80px] h-[90px]">
                        <div className='flex justify-end text-[15px] text-[#552F2F] underline pb-8 cursor-pointer' onClick={()=>handleLogout()}>로그아웃</div>
                        <div className='flex w-[200px] h-[50px] bg-[#552F2F] rounded-2xl justify-center items-center cursor-pointer'  onClick={()=>{setOpenModal(true)}}>
                            <div className='text-[20px] text-white text-center'>프로필 수정</div>
                        </div>
                        {modal && <ProfileModal data={userData} onClose={() => setOpenModal(false)}  />}
                    </div>
                    </div>


            </div>
        
        
        
    );
}

export default UserProfile;