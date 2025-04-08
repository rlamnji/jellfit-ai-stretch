import CardCarousel from "../../components/card_carousel/card_carousel";
import TopBar from "../../components/top_bar";

function GuideByBodyPage(){
    return(
        <div>
            <TopBar />
            <div className="header">
                <h1>상황 별 스트레칭 가이드</h1>      
                <div>스트레칭이 필요한 순간을 선택해볼까요?</div>
            </div>
            <CardCarousel />
        </div>
    );
}
export default GuideByBodyPage;