import { useEffect, useState } from "react";
import FocusedCard from "./focused_card";
import PreviewCard from "./preview_card";
import imgLeft from '../../assets/images/left.png';
import imgRight from "../../assets/images/right.png";

function CardCarousel({bodyCards}){
    const [currentIndex, setcurrentIndex] = useState(1);
    const [leftIndex, setLeftIndex] = useState(currentIndex - 1);
    const [rightIndex, setRightIndex] = useState(currentIndex + 1);
    const lastIndex = bodyCards.length - 1;
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
    console.log(bodyCards[0]);
    return(
        <div>
            <div className="carouselItems" class="flex justify-center items-center">
                {/* props으로 인덱스를 넘겨야할지 bodyCards값 자체를 넘겨야할지 뭐가 더 나은지 몰겄다.. */}
                <PreviewCard card={bodyCards[leftIndex]}/> 
                <FocusedCard card={bodyCards[currentIndex]}/>
                <PreviewCard card={bodyCards[rightIndex]}/>
            </div>
            {/* 위치 fix하기 */}
            <div class="fixed">
                <button id="left_btn" onClick={moveLeft}>
                    <img src={imgLeft} alt="왼쪽 버튼" />
                </button>
                <button id="right_btn" onClick={moveRight}>
                    <img src={imgRight} alt="오른쪽 버튼" />
                </button>
            </div>
        </div>
    );
}
export default CardCarousel;