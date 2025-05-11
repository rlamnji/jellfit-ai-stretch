import TopBar from "../../components/top_bar";
import jellyfishMenu from "../../assets/images/icons/jellyfish_list.png";
import { useEffect, useState } from "react";
import Stretching from "../../components/stretching/stretching";
import SelectedStretching from "../../components/stretching/selected_stretching";
import { useNavigate } from "react-router-dom";


function SelectGuidePage({ setStretchingOrder }) {
    
    //랜덤 선택해지는 기능 (미완성)
  
    const [mainCategory, setMainCategory] = useState('신체부위');
    const [subCategory, setSubCategory] = useState('목');
    const [stretchingList, setStretchingList] = useState([]); 
    const [selectedStretchingList, setSelectedStretchingList] = useState([]);
    const navigate = useNavigate();

    const subCategories = {
        '신체부위' : ['목', '어깨', '팔/손목', '등/허리'],
        '상황' : ['자기 전', '일어나서', '작업 하기 전', '식사 후'],
        '내 스트레칭' : ['']
    };

    const handleMainCategory = (categoryName) => {
        setMainCategory(categoryName);
    }

    const showSubCategories = () =>{
        return subCategories[mainCategory].map((item) => (
            <li key={item} 
            className={`${subCategory === item ? 'text-[#1D1D1D]' : 'text-[#7C7B7B]'}`} 
            onClick={() =>{handleSubCategoryClick(item)}}
            >
                    <button>{item}</button>
                </li>
        ));  
    }
    // 카테고리 클릭 시 해당 카테고리의 스트레칭 리스트를 가져오는 기능
    const handleSubCategoryClick = (categoryName) => {
        console.log(`카테고리 이름: ${categoryName}`); //ok
        setSubCategory(categoryName);
    }
    useEffect(() =>{
        async function fetchData() {
            const stretchingList = await getStretchingData(subCategory); //배열로 받음.
            setStretchingList(stretchingList);
        }
        fetchData();
    }, [subCategory]);

    const getStretchingData = async (categoryName) => {
        // 카테고리별 목업 데이터
        const mockData = {
            '팔/손목': [
                {
                    id: 1,
                    name: "손목 돌리기",
                    imageURL: "/images/stretching/smdrg.png",
                    videoURL: "https://www.youtube.com/shorts/-0nB9SlxzO4",
                },
            ],
            '등/허리': [
                {
                    id: 2,
                    name: "팔꿈치 굽혀서 옆구리 늘리기",
                    imageURL: "/images/stretching/pkcghsygrnrg.png",
                    videoURL: "https://www.youtube.com/watch?v=RobdPJZAxdM",
                },
                {
                    id: 3,
                    name: "팔 앞으로 쭉 뻗기",
                    imageURL: "/images/stretching/paprjpg.png",
                    videoURL: "https://www.youtube.com/shorts/ye8pe1j5OeQ",
                }
            ],
        };
        return mockData[categoryName] || []; //없으면 빈 배열 반환.
        //서버완성되면 mockData 지우고 이거 쓰면 됨.
        // const res = fetch('/guide/select', {
        //     method : 'POST',
        //     headers : {
        //         'content-type' : 'application/json'
        //     },
        //     body: JSON.stringify({
        //         categoryName: subCategory,
        //     })
        // });
        // if(res.ok){
        //     const { stretchingList } = await res.json(); //스트레칭 id, name, imageURL, videoURL이 담긴 리스트.
        //     return stretchingList;
        // }else{
        //     console.error('스트레칭이 없습니다.'); //에러처리 코드가 이게 맞는지 모르겠음. 수정 필요. (0504)
            
        // }
    }
    const showStretchingList = (stretchingList) => { 
        return stretchingList.map((stretching) => (
            <li key={stretching.id}>
                <Stretching stretching={stretching} onClick={handleStrechingSelect}/>
            </li>
        ));
    }

    //스트레칭 담기 기능.
    const handleStrechingSelect = (stretching) => {
        console.log(stretching);
        console.log(`스트레칭 이름: ${stretching.name}`);
        setSelectedStretchingList((prev) => {
            // 중복 스트레칭 & 5개 초과 담기 방지.
            if (prev.some((item) => item.id === stretching.id)) {
                return prev;
            }else if (prev.length > 5) {
                alert("최대 5개까지 담을 수 있어요.");
                return prev;
            }
            return [...prev, stretching];
        });
    };
    const showSelectedStretchingList = () => {
        return selectedStretchingList.map((stretching) => (
            <li key={stretching.id}
                className="selectedStretching w-[90%] h-[44px] mt-2 z-10 pt-1 pl-2 bg-[#F1E9E9] hover:bg-[#beb5b4] rounded-3xl font-semibold text-[#786B5D]"
            >
                <SelectedStretching 
                    name={stretching.name}
                    onClick={() => handleSelectedStretchingDelete(stretching.id)} 
                />
            </li>
        ));
    };
    const handleSelectedStretchingDelete = (id) => {
        setSelectedStretchingList((prev) => prev.filter((item) => item.id !== id));
    };
    const handleStartbuttonClick = (selectedStretchingList) =>{
        //시작하기 버튼 클릭했을 때 담긴 스트레칭 리스트를 서버에 보내는 기능
        //1. 스트레칭 리스트에서 id만 뽑아서 배열로 만들기.
        if(selectedStretchingList.length === 0){
            alert("스트레칭을 담아주세요.");
            return;
        } else {
            const selectedStretchingIds = selectedStretchingList.map((stretching) => stretching.id);
            console.log(selectedStretchingIds); //ok
            setStretchingOrder(selectedStretchingIds); //동적 라우터 생성.
            navigate(`/guide/video/${selectedStretchingIds[0]}`); //첫번째 스트레칭 가이드 영상 화면으로 이동.
        }
    }
    return(
        <div className="w-full h-screen bg-[#E5D2D2]">
            <TopBar />
            <div className="header mt-4 ml-12 mb-4">
                <h1 className="mb-4 font-bold text-3xl text-[#522B2B]">가이드 루틴을 골라볼까요?</h1>
                <div className="mb-1 text-lg text-[#895555]">원하는 스트레칭을 골라 담아보세요</div>
                <div className="text-lg text-[#895555]">담은 순서대로 스트레칭 가이드가 진행돼요</div>
            </div>
            <div className="contentBox flex lg:w-[90%]] h-[480px] ml-12 mr-12 p-4  bg-[#fcfafa] rounded-3xl">
                <button className="w-[28px] h-[24px]">
                    <img src={jellyfishMenu} alt="잠긴 해파리 리스트 볼 수 있는 메뉴" />
                </button>
                <div className="selectPart w-4/6">
                    <div className="ml-4 category">
                        <ul className="mainCategory flex gap-4">
                            <li>
                                <button className={`${mainCategory === '신체부위' ? 'text-[#1D1D1D]' : 'text-[#7C7B7B]'}`} onClick={() =>{handleMainCategory('신체부위')}}>
                                    신체부위
                                </button>
                            </li>
                            <li>
                                <button className={`${mainCategory === '상황' ? 'text-[#1D1D1D]' : 'text-[#7C7B7B]'}`} onClick={() =>{handleMainCategory('상황')}}>
                                    상황
                                </button>
                            </li>
                            <li>
                                <button className={`${mainCategory === '내 스트레칭' ? 'text-[#1D1D1D]' : 'text-[#7C7B7B]'}`} onClick={() =>{handleMainCategory('내 스트레칭')}}>
                                    내 스트레칭
                                </button>
                            </li>
                        </ul>
                        <ul className="subCategory flex gap-4 text-[#7C7B7B]">
                            {showSubCategories()}    
                        </ul>
                    </div>
                    <ul className="stretchingList flex">
                        {showStretchingList(stretchingList)} 
                    </ul>
                </div>
                <div className="selectedPart w-[30%]">
                    <h1 className="mb-6 font-semibold text-xl text-[#522B2B]">담긴 스트레칭</h1>
                    <div className="w-[90%] h-[300px] bg-[#dad1d1] rounded-3xl">
                        <ul className="selectedStretchingList flex flex-col items-center pt-4">
                            {showSelectedStretchingList(selectedStretchingList)}
                        </ul>
                    </div>
                    <button 
                        className="w-[76%] h-[48px] mt-6 ml-4 bg-[#552F2F] rounded-3xl font-bold text-xl text-white hover:bg-[#7C4A4A]"
                        onClick={() =>{handleStartbuttonClick(selectedStretchingList)}}
                    >
                        시작하기
                    </button>
                </div>
            </div>

        </div>

    );
}
export default SelectGuidePage;


