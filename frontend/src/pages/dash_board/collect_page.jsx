// 도감 페이지
// tailwindcss 사용
import { useNavigate } from 'react-router-dom';
import collectBox from '../../assets/images/icons/home/collect_box.png';
import collectBook from '../../assets/images/icons/home/collect_book.png';
import collectCancel from '../../assets/images/icons/home/collect_cancel.png';
import backgroundImg from '../../assets/images/etc/basic_background2.png';
import styles from '../../styles/pages/collect_page.module.css';

function CollectPage() {
   const navigate = useNavigate();
   const backgroundImage = `url(${backgroundImg})`;

    return (
      <div className="relative bg-cover bg-center bg-no-repeat w-screen h-screen flex flex-col items-center justify-center" style={{ backgroundImage }}>
      <div className="relative flex justify-center items-center w-[85%] animate-[moveing_2s_ease-in-out_infinite]">
         {/* 배경 책 이미지 */}
         <img src={collectBook} className="w-full" />

         {/* 닫기 버튼 */}
         <img
            src={collectCancel}
            className="absolute top-[12%] right-[12%] translate-x-1/2 -translate-y-1/2 w-[5vw] cursor-pointer"
            onClick={() => navigate('/home')}
         />

         {/* 왼쪽 콘텐츠 */}
         <div className="absolute bg-gray-200 top-[20.5%] left-[19%] w-[20%] h-[25%]">
            여기에 해파리 이미지
         </div>
         <div className="absolute top-[56%] left-[15%] text-[#513030] text-[1.5vw] font-bold blur-[0.5px]">
            한 입 먹힌 해파리(DB)
         </div>
         <div className="absolute top-[69%] left-[15%] w-[28%] h-[15%] text-[#513030] text-[1.2vw] blur-[0.5px] overflow-y-auto break-words whitespace-normal">
            DB에 있는 설명 ! 너무 길면 스크롤 되게 했음!!
         </div>

         {/* 오른쪽 도감 박스 */}
         <div className="absolute top-[18%] left-[52%] w-[37%] h-[69%] overflow-y-auto grid grid-cols-4 gap-4 p-4 auto-rows-auto">
            {Array.from({ length: 40 }).map((_, i) => (
               <img key={i} src={collectBox} className="w-full object-contain block cursor-pointer" />
            ))}
         </div>
      </div>
      </div>

    );
  }
  
  export default CollectPage;
  