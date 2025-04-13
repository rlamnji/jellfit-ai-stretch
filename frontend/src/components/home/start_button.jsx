// 자율모드, 가이드모드 시작 버튼
// tailwindcss 사용
import freeModeBtn from '../../assets/images/icons/free_mode.png';
import guideModeBtn from '../../assets/images/icons/guide_mode.png';

function StartButton() {
  return (
    <div className="flex justify-center items-center">
        <div>
            <img src={freeModeBtn} className="w-[200px] animate-[moveing_3s_ease-in-out_infinite] transition-transform duration-200 cursor-pointer hover:animate-none hover:-translate-y-[5px] hover:scale-[1.02]" alt="자율모드" />
        </div>
        <div>
            <img src={guideModeBtn} className="w-[200px] animate-[moveing_3s_ease-in-out_infinite] transition-transform duration-200 cursor-pointer hover:animate-none hover:-translate-y-[5px] hover:scale-[1.02]" alt="가이드모드" />
        </div>
    </div>
  );
}

export default StartButton;
