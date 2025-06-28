// 로그인 페이지
// 라이브러리
import { Link } from 'react-router-dom';

// 컴포넌트
import LoginForm from '../components/login_form';
import SoundBtn from '../../components/buttons/sound_btn'; // 공통

// 이미지/에셋
import imgLogo from '../../assets/images/etc/logo_title.png';
import imgCloudLeft from '../../assets/images/etc/cloud_left.png';
import imgCloudRight from '../../assets/images/etc/cloud_right.png';
import background from '../../assets/images/etc/basic_background2.png';


function LoginPage(){
    return (
        <div>
            {/* 배경 이미지 */}
            <img
                src={background}
                alt="Background"
                className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
            />
            <div className='w-full h-screen flex flex-col items-center'>
                {/* 상단 사운드 버튼 */}
                <div class="w-full h-14 flex justify-end ">
                    <SoundBtn />
                </div>

                {/* 타이틀 이미지 */}
                <div className='header w-fit h-fit p-1'>
                    <img className='w-[400px] h-[200px]' src={imgLogo} alt="젤핏(JellFit) 타이틀 로고" />
                </div>

                {/* 로그인 폼 + 배경 구름 이미지 */}
                <div className="relative w-[350px] h-auto">
                    <LoginForm/>
                    <img className="absolute w-[600px] h-[240px] -left-64 top-40" src={imgCloudLeft} alt="왼쪽 구름" />
                    <img className="absolute w-[320px] h-[268px] -right-72 -top-16" src={imgCloudRight} alt="오른쪽 구름" />
                </div>

                {/* 회원가입 안내 문구 */}
                <div className='joinContainer flex m-4'>
                    <div className='mr-3 font-medium text-[#BCBCBC] text-lg'>젤핏이 처음이라면?</div>
                    <Link to="/join" className='font-semibold text-[#BCBCBC] text-lg underline'>회원가입</Link>
                </div>
            </div>
        </div>
    );
}


export default LoginPage;