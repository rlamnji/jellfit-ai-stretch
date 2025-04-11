import img from '../../assets/images/left.png';
function LeftBtn(){
    return(
        <div>
            <button>
                <img src={img} alt="카드 스크롤 중 왼쪽 버튼" />
            </button>
        </div>
    );
}
export default LeftBtn;