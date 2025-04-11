import CardCarousel from "../../components/card_carousel/card_carousel";
import TopBar from "../../components/top_bar";

function GuideByBodyPage(){
    const bodyCards = [
        {
            name : '목',
            effect : '뻐근한 목 완화 / 거북목 예방'
        },
        {
            name : '어깨',
            effect : '어깨 결림 해소 / 혈액순환 개선'
        },
        {
            name : '가슴',
            effect : '말린 어깨 개선, 깊은 호흡 도움'
        },
    ];
    return(
        <div class="bg-black w-full h-full">
            <TopBar />
            <div className="header">
                <h1 class="text-white">부위 별 스트레칭 가이드</h1>
                <div class="text-white">배우고 싶은 스트레칭 부위를 선택해볼까요?</div>
            </div>
            <CardCarousel bodyCards={bodyCards}/>
        </div>
    );
}
export default GuideByBodyPage;