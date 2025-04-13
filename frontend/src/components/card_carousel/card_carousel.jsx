import { useEffect, useState } from "react";
import FocusedCard from "./focused_card";
import PreviewCard from "./preview_card";
import imgLeft from '../../assets/images/left.png';
import imgRight from "../../assets/images/right.png";

function CardCarousel({cards}){
    const [currentIndex, setcurrentIndex] = useState(1);
    const [leftIndex, setLeftIndex] = useState(currentIndex - 1);
    const [rightIndex, setRightIndex] = useState(currentIndex + 1);
    const lastIndex = cards.length - 1;
    const firstIndex = 0;
    const moveLeft = () =>{
        if(currentIndex === lastIndex - 1){
            setLeftIndex(currentIndex);
            setcurrentIndex(currentIndex + 1);
            setRightIndex(firstIndex);
        } else if(currentIndex === lastIndex){
            setLeftIndex(currentIndex);
            setcurrentIndex(firstIndex);
            setRightIndex(firstIndex + 1);
        } else{
            setLeftIndex(currentIndex);
            setcurrentIndex(currentIndex + 1);
            setRightIndex(currentIndex + 2);
        }
    }  
    const moveRight = () =>{
        if(currentIndex === firstIndex + 1){
            setLeftIndex(lastIndex);
            setcurrentIndex(currentIndex - 1);
            setRightIndex(currentIndex);
        } else if(currentIndex === firstIndex){
            setLeftIndex(lastIndex - 1);
            setcurrentIndex(lastIndex);
            setRightIndex(firstIndex);
        } else{
            setLeftIndex(currentIndex - 2);
            setcurrentIndex(currentIndex - 1);
            setRightIndex(currentIndex);
        }
    }
    console.log(cards[0]);
    return(
        <div className="relative p-8">
            <div className="carouselItems flex justify-center items-center">
                {/* props으로 인덱스를 넘겨야할지 cards값 자체를 넘겨야할지 뭐가 더 나은지 몰겄다.. */}
                <PreviewCard card={cards[leftIndex]}/> 
                <FocusedCard card={cards[currentIndex]}/>
                <PreviewCard card={cards[rightIndex]}/>
            </div>
            {/* 위치 fix하기 */}
            <div className="flex justify-between w-[390px] h-16 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button id="left_btn" className="w-16 h-16" onClick={moveLeft}>
                    <img src={imgLeft} alt="왼쪽 버튼" />
                </button>
                <button id="right_btn" className="w-16 h-16" onClick={moveRight}>
                    <img src={imgRight} alt="오른쪽 버튼" />
                </button>
            </div>
        </div>
    );
}
export default CardCarousel;