// 상세프로필 수정 (프로필수정 모달창)
import DetailModal from '../../assets/images/icons/detail_user_modal.png';
import setCancel from '../../assets/images/icons/cancel.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 커스텀 훅
import { useUserProfile } from '../hooks/use_user_profile';

function ProfileModal({data, onClose}){

    const profileImg_1 = "/images/profile/profile_1.png";
    const profileImg_2 = "/images/profile/profile_2.png";

    const [username, setUsername] = useState(data?.username || "");
    const [introduction, setIntroduction] = useState(data?.introduction || "");
    const [isVisible, setIsVisible] = useState(false);

    const { changeUserProfile, msg, setMsg } = useUserProfile();

    const selectedProfile = isVisible ? profileImg_2 : profileImg_1;
    

    useEffect(() => {
        if (data) {
            setUsername(data.username);
            setIntroduction(data.introduction);
        }
    }, [data]);

        return (
            <div className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-50 flex justify-center items-center pointer-events-auto'>
                
                <div className='relative overflow-hidden '> 
                    <div className="flex flex-col absolute left-1/2 -translate-x-1/2 top-[45px]">
                        <div className='self-start text-[25px] text-[#7E6161] font-bold mb-4 ml-2'>프로필 수정</div>

                        <div className='flex justify-center mb-4'>
                            <img src={data.profile_url} className='w-[120px] h-[120px] rounded-full object-cover mb-4' />
                        </div>
                        

                        <div className='flex flex-row items-center mb-3'>
                            <div className="text-[#7E6161] text-[14px] w-[80px] font-bold">
                                닉네임
                            </div>
                            <div>
                                <input type="text" className='w-[300px] h-[50px] bg-white opacity-30 rounded-full text-[#7E6161] text-[20px] font-bold pl-4' 
                                value={username}  onChange={(e) => setUsername(e.target.value)}/>
                            </div>
                        </div>

                        <div className='flex flex-row items-center  mb-4'>
                            <div className="text-[#7E6161] text-[14px] w-[80px] font-bold">
                                한줄소개
                            </div>
                            <div>
                                <input type="text" className='w-[300px] h-[50px] bg-white opacity-30 rounded-full text-[#7E6161] text-[20px] font-bold pl-4'  
                                value={introduction} onChange={(e) => setIntroduction(e.target.value)}/>
                            </div>
                        </div>

                        <div className='flex flex-row items-center  mb-3'>
                            <div className="text-[#7E6161] text-[14px] w-[80px] font-bold">
                                프로필 변경
                            </div>
                        </div>

                        <div className='flex justify-around mb-4'>
                            <img
                                src={profileImg_2}
                                className={`w-[100px] h-[100px] rounded-full object-cover cursor-pointer ${
                                isVisible ? 'opacity-100' : 'opacity-30'
                                }`}
                                onClick={() => {setIsVisible(true);}}
                            />
                            <img
                                src={profileImg_1}
                                className={`w-[100px] h-[100px] rounded-full object-cover cursor-pointer ${
                                isVisible ? 'opacity-30' : 'opacity-100'
                                }`}
                                onClick={() => setIsVisible(false)}
                            />
                        </div>

                        <div className='flex justify-center'>
                        <div className='flex w-[150px] h-[50px] bg-[#552F2F] rounded-2xl justify-center items-center cursor-pointer'>
                            <div className='text-[20px] text-white text-center' onClick={()=>changeUserProfile( data.user_id, selectedProfile, username, introduction)}>저장</div>
                        </div>
                    </div>
                    </div>

                    <img src={DetailModal} className='w-[600px] h-[600px] object-contain block'/>
                    <div className="absolute w-[40px] top-7 right-[93px] cursor-pointer" onClick={onClose}>
                        <img src={setCancel}/>
                    </div>

                </div>

                {msg && (
                <div className="absolute top-[20px] left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-[#ffffff] text-[#552F2F] font-bold px-6 py-3 rounded-full shadow-md text-center text-[18px]">
                    {msg}
                    </div>
                </div>
                )}
            
            </div>
        );

    

}

export default ProfileModal;