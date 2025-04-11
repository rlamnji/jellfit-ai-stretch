import arrowLeft from '../../assets/images/icons/arrow_left.png';
function BackBtn(){
    return(
        <div class="w-8 h-8 m-4 z-10">
            <button>
                <img src={arrowLeft} alt="뒤로가기버튼" />
            </button>
        </div>
    );
}
export default BackBtn;