import { Link, useNavigate } from 'react-router-dom';
import arrowLeft from '../../assets/images/icons/arrow_left.png';

function BackBtn(){
    const navigate = useNavigate();
    return(
        <button className="w-8 h-8 m-4" onClick={() => navigate(-1)}>
                <img src={arrowLeft} alt="뒤로가기버튼" />
        </button>
    );
}
export default BackBtn;
