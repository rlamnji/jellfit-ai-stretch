import { useNavigate } from 'react-router-dom';

import background from '../../assets/images/etc/basic_background2.png';
import arrow from '../../assets/images/icons/arrow.png';
import friendsContent from '../../assets/images/icons/friends/friends_content.png';
function UserProfile(){
    const navigate = useNavigate();
    return (
        <div className="user-profile">
            <img
                src={background}
                alt="Background"
                className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
            />
            <img src={arrow} className="w-[30px] cursor-pointer m-[10px] z-[1]" onClick={()=>navigate('/home')}/>

            <div className='relative top-[8vh] w-[1100px] h-[650px] mx-auto flex justify-center items-center text-center z-0'>
                <img className="absolute top-0 left-0 flex justify-center w-full h-full z-0 pointer-events-none" src={friendsContent}/>
            
                <div className='absolute flex flex-col justify-center'>
                    <div className='text-[60px]'>프로필 수정</div>
                    <div className='text-[60px]'>통증 부위</div>
                    <div className='text-[60px]'>이용 약관</div>
                </div>

            </div>
        
        
        </div>
    );
}

export default UserProfile;