// 회원가입 페이지
// 라이브러리

// 컴포넌트
import SuccessModal from '../../components/success_modal';
import TopBar from '../../components/top_bar'; // 공통
import JoinForm from '../components/join_form';

// 훅(커스텀 훅)
import { useJoinForm } from '../hooks/use_join_form';

// 이미지/에셋
import imgJoinLogo from '../../assets/images/etc/join_title.png';
import imgCloudLeft from '../../assets/images/etc/cloud_left.png';
import imgCloudRight from '../../assets/images/etc/cloud_right.png';
import background from '../../assets/images/etc/basic_background2.png';


function JoinPage (){
    const { showSuccessModal } = useJoinForm();
    
    return (
        <div>
            {/* 배경 이미지 */}
            <img
            src={background}
            alt="Background"
            className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
            />
            <div className='w-full h-screen flex flex-col items-center'>
                {/* 상단 버튼 (사운드, 뒤로가기)*/}
                <TopBar />

                {/* 타이틀 이미지 */}
                <div className='header w-fit h-fit p-1'>
                    <img className='w-[400px] h-[160px]' src={imgJoinLogo} alt="젤핏(JellFit) 회원가입 타이틀" />
                </div>

                {/* 회원가입 폼 + 배경 구름 이미지 */}
                <div className="relative w-[350px] h-auto">
                    <JoinForm />
                    {/* 회원가입 성공 시 모달 창 생성 */}
                    {showSuccessModal && <SuccessModal message="회원가입이 완료되었습니다!" />}      
                    <img className="absolute w-[600px] h-[200px] -left-60 top-40" src={imgCloudLeft} alt="왼쪽 구름" />
                    <img className="absolute w-[500px] h-[200px] -right-80 -top-10" src={imgCloudRight} alt="오른쪽 구름" />
                </div>
            </div>
        </div>
    );
}
export default JoinPage;

