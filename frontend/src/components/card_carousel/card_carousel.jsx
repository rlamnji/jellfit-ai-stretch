import FocusedCard from "./focused_card";
import PreviewCard from "./preview_card";

function CardCarousel(){
    return(
        <div>
            <PreviewCard />
            <FocusedCard />
            <PreviewCard />
            {/* 위치 fix하기 */}
            
        </div>
    );
}
export default CardCarousel;