// 상세프로필 수정 (이용약관)
import { useState } from 'react';
import TermsModal from './user_terms_modal.jsx';

// txt파일 로 저장 후 불러오기
function Terms(){
    const [modal, setModal] = useState(null);
    
    return (
        <div className="z-10 flex flex-col justify-start w-[300px] h-[200px] mt-4 left-11 ">
            <div className='flex w-[200px] h-[50px] bg-[#7A7668] rounded-2xl justify-center items-center'>
                <div className='text-[20px] text-white text-center'>이용 약관</div>
            </div>

            <div className='text-start text-[#694B4B] text-[20px] pt-4'>
                <div className="mb-2 cursor-pointer" onClick={()=>{setModal("1")}}> ▶ 개인정보 수집 및 카메라 접근 </div>
                <div className="mb-2 cursor-pointer" onClick={()=>{setModal("2")}}> ▶ 개인정보 보관 및 이용자의 권리 </div>
                <div className="mb-2 cursor-pointer" onClick={()=>{setModal("3")}}> ▶ 서비스 이용 제한 및 보안 정책 </div>
            </div>

            {modal && <TermsModal type={modal} onClose={() => setModal(null)} />}
        
        </div>
    );
}

export default Terms;