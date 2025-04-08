import CardCarousel from "../../components/card_carousel/card_carousel";
import TopBar from "../../components/top_bar";

function GuideByBodyPage(){
    return(
        <div>
            <TopBar />
            <div className="header">
                <h1>부위 별 스트레칭 가이드</h1>
                <div>배우고 싶은 스트레칭 부위를 선택해볼까요?</div>
            </div>
            <CardCarousel />
        </div>
    );
}
export default GuideByBodyPage;