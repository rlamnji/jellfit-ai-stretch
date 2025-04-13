import CardCarousel from "../../components/card_carousel/card_carousel";
import TopBar from "../../components/top_bar";
import imgDropdown from "../../assets/images/dropdown_btn.png";
// import imgDropup from "../../assets/images/dropup_btn.png";
import { useState } from "react";
import { Link } from "react-router-dom";

function GuideBySituationPage(){
    const cards = [
        {
            name : '자기 전에',
            effect : '뻐근한 목 완화 / 거북목 예방'
        },
        {
            name : '일 시작 전에',
            effect : '어깨 결림 해소 / 혈액순환 개선'
        },
        {
            name : '일을 마치고',
            effect : '말린 어깨 개선 / 깊은 호흡 도움'
        },
        {
            name : '온 몸이 뻐근할 때',
            effect : '말린 어깨 개선 / 깊은 호흡 도움'
        }
    ];
    const [isOpen, setIsOpen] = useState(false);
    //바깥 클릭했을 때 드롭다운 사라지는거 구현해야됨. (미완성)
    const handleDropdownClick = () =>{
        setIsOpen(true);
    };

    return(
        <div class="bg-black w-full h-screen">
            <TopBar />
            <div className="header relative m-5">
                <div className="titleContainer mb-3 flex items-center">
                    <h1 className=" text-white text-4xl font-semibold">상황 별 스트레칭 가이드</h1>
                    <button className="w-4 h-4" onClick={handleDropdownClick}>
                        <img src={imgDropdown} alt="드롭다운 버튼" />
                    </button>
                </div>
                <div class="text-[#D2D0D0] text-md">스트레칭이 필요한 순간을 선택해볼까요?</div>
                <div className={`w-1/2 h-auto itemList absolute top-0 left-24 bg-black border-2 rounded-xl ${isOpen ? 'block' : 'hidden'}`}>
                <ul className="pr-2 flex flex-col items-end justify-center">
                    <li className="m-4 font-semibold hover:bg-[#CCCCCC] hover:opacity-23 hover:rounded-md text-white text-lg">
                        <Link to='/guide/body'>부위 별 스트레칭 가이드</Link>
                    </li>
                    <li className="m-4 font-semibold hover:bg-[#CCCCCC] hover:opacity-23 hover:rounded-md text-white text-lg"
                    >상황 별 스트레칭 가이드</li>
                </ul>
            </div>
            </div>
            <CardCarousel cards={cards}/>
            <div></div>
        </div>
    );
}
export default GuideBySituationPage;