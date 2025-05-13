import { useNavigate } from "react-router-dom";
function GuideCompletePage () {
    const navigate = useNavigate();
    const handleCompletebuttonClick = () => {
        navigate('/home');
    }
    return(
        <div>
            <div>스트레칭 완료</div>
            <button 
                className="flex items-center justify-center w-[100px] h-[40px] bg-[#FBF2E6] font-extrabold text-[#5D3939] rounded-3xl"
                onClick={handleCompletebuttonClick}
            >
                완료
            </button>
        </div>
    );
}
export default GuideCompletePage;