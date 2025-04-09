import arrowLeft from '../../assets/images/icons/arrow_left.png';
function BackBtn(){
    return(
        <div>
            <button>
                <img src={arrowLeft} alt="뒤로가기버튼" />
            </button>
        </div>
    );
}
export default BackBtn;