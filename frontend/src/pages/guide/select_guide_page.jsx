import TopBar from "../../components/top_bar";
import jellyfishMenu from "../../assets/images/icons/jellyfish_list.png";

function SelectGuidePage(){
    return(
        <div className="w-full h-screen bg-[#E5D2D2]">
            <TopBar />
            <div className="header mt-4 ml-12 mb-4">
                <h1 className="mb-4 font-bold text-3xl text-[#522B2B]">가이드 루틴을 골라볼까요?</h1>
                <div className="mb-1 text-lg text-[#895555]">원하는 스트레칭을 골라 담아보세요</div>
                <div className="text-lg text-[#895555]">담은 순서대로 스트레칭 가이드가 진행돼요</div>
            </div>
            <div className="contentBox flex lg:w-[90%]] h-[480px] ml-12 mr-12 p-4  bg-white opacity-88 rounded-3xl">
                <button className="w-[28px] h-[24px]">
                    <img src={jellyfishMenu} alt="잠긴 해파리 리스트 볼 수 있는 메뉴" />
                </button>
                <div className="selectPart w-4/6">
                    <div className="ml-4 category">
                        <ul className="flex gap-4 text-[#7C7B7B]">
                            <li>신체부위</li>
                            <li>상황</li>
                            <li>나만의 루틴</li>
                        </ul>
                        <ul className="flex gap-4 text-[#7C7B7B]">
                            <li>목</li>
                            <li>어깨</li>
                            <li>팔/손목</li>
                            <li>등/허리</li>
                            <li>가슴</li>
                        </ul>
                    </div>
                </div>
                <div className="checkedPart w-[30%]">
                    <h1 className="mb-6 font-semibold text-xl text-[#522B2B]">담긴 스트레칭</h1>
                    <div className="w-[90%] h-[300px] bg-[#522B2B] opacity-20 rounded-3xl"></div>
                    <button className="w-[76%] h-[48px] mt-6 ml-4 bg-[#552F2F] rounded-3xl">
                        <div className="font-bold text-xl text-white" >시작하기</div>
                    </button>
                </div>
            </div>

        </div>

    );
}
export default SelectGuidePage;