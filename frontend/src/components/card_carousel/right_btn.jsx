import img from "../../assets/images/right.png";
function RightBtn(){
    return(
        <div>
            <button>
                <img src={img} alt="카드 스크롤 중 오른쪽 버튼" />
            </button>
        </div>
    );
}
export default RightBtn;