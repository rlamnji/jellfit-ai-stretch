import arrowLeft from '../../assets/images/icons/arrow_left.png';
import { Link } from 'react-router-dom';

function BackBtn(){
    return(
        <div class="w-8 h-8 m-4">
            <Link to="/home">
                <img src={arrowLeft} alt="뒤로가기버튼" />
            </Link>
        </div>
    );
}
export default BackBtn;