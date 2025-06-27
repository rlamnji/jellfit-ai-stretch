// 상세프로필 수정 (이용약관)
import DetailModal from '../../assets/images/icons/detail_user_modal.png';
import setCancel from '../../assets/images/icons/cancel.png';
import userTerms1 from '../../assets/txt/user_terms1.txt';
import userTerms2 from '../../assets/txt/user_terms2.txt';
import userTerms3 from '../../assets/txt/user_terms3.txt';
import { useEffect, useState } from 'react';

function TermsModal({type, onClose}){
    const [content, setContent] = useState('');
    const [fileTitle, setFileTitle] = useState('');

    // txt파일 로 저장 후 불러오기
    useEffect(() => {
      let filePath = '';
      let title = '';

      switch (type) {
        case '1':
          filePath = userTerms1;
          title = '개인정보 수집 및 카메라 접근';
          break;
        case '2':
          filePath = userTerms2;
          title ='개인정보 보관 및 이용자의 권리';
          break;
        case '3':
          filePath = userTerms3;
          title ='서비스 이용 제한 및 보안 정책';
          break;
        default:
          setContent('해당 내용을 찾을 수 없습니다.');
          return;
      }
  
      fetch(filePath)
        .then((res) => res.text())
        .then((text) => {setContent(text); setFileTitle(title);})
        .catch((err) => {setContent('불러오는 중 오류 발생'); setFileTitle('');});
    }, [type]);

        return (
            <div className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[9999999] flex justify-center items-center pointer-events-auto'>
                
                <div className='relative overflow-hidden'> {/* 이용약관 전체 이미지 */}
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 ">
                        <div className='text-[25px] text-[#7E6161] font-bold mb-4 ml-4 mt-2'>개인정보 이용약관</div>
                        <div className='text-[20px] text-[#7E6161] font-bold mb-4'>{fileTitle}</div>
                        <pre className="font-sans whitespace-pre-wrap w-[400px] h-[400px] overflow-y-auto text-[#85756b] text-[14px] z-[10]">{content}</pre>
                    </div>

                    <img src={DetailModal} className='w-[600px] h-[600px] object-contain block'/>
                    <div className="absolute w-[40px] top-7 right-[93px] cursor-pointer" onClick={onClose}>
                        <img src={setCancel}/>
                    </div>
                    
                </div>
            
            </div>
        );

    

}

export default TermsModal;