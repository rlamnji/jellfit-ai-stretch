import TopBar from "../../components/top_bar";
import jellyfishMenu from "../../assets/images/icons/jellyfish_list.png";
import { useEffect, useState } from "react";
import Stretching from "../../components/stretching/stretching";
import SelectedStretching from "../../components/stretching/selected_stretching";
import { useNavigate } from "react-router-dom";

import dice from '../../../src/assets/images/icons/guide_dice.png'

function SelectGuidePage({ setStretchingOrder, setCompletedStretchings }) {
    
    const [selectFav, setSelectFav] = useState(false); // 즐찾
    const [randomGuideSelect, setRandomGuideSelect] = useState(0); // 랜덤 선택
    const [allStretchingList, setAllStretchingList] = useState([]); // 전체 스트레칭 리스트
   
    const [mainCategory, setMainCategory] = useState('신체부위');
    const [subCategory, setSubCategory] = useState('목');
    const [stretchingList, setStretchingList] = useState([]); 
    const [selectedStretchingList, setSelectedStretchingList] = useState([]);
    const navigate = useNavigate();

    const subCategories = {
        '신체부위' : ['목', '어깨', '팔/손목', '등/허리', '가슴'],
        '상황' : ['자기 전', '일어나서', '작업 하기 전', '식사 후'],
        '내 스트레칭' : ['']
    };

    const handleMainCategory = (categoryName) => {
        setMainCategory(categoryName);

          if (categoryName === '내 스트레칭') {
            // 로컬스토리지에서 '내 루틴' 불러오기
            const saved = localStorage.getItem("myStretchings");
            if (saved) {
                setStretchingList(JSON.parse(saved));
            } else {
                alert("저장된 내 스트레칭 루틴이 없습니다.");
                setStretchingList([]);
            }
        }
    };

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
            if (mainCategory === '내 스트레칭') {
                return; // ❌ 서버 요청하지 않음
            }
            console.log(`서버로 전송할 카테고리: ${subCategory}`); //ok
            const stretchingList = await getStretchingData(subCategory); //배열로 받음.
            setStretchingList(stretchingList);
        }
        fetchData();
    }, [subCategory]);

    const getStretchingData = async (categoryName) => {
        // 서버완성되면 mockData 지우고 이거 쓰면 됨.
        const res = await fetch('http://localhost:8000/guide/select', {
            method : 'POST',
            headers : {
                'content-type' : 'application/json'
            },
            body: JSON.stringify({
                categoryName: categoryName,
            })
        });

        if(res.ok){
            const stretchingList = await res.json(); //스트레칭 id, name, imageURL, videoURL이 담긴 리스트.
            console.log('스트레칭 리스트:', stretchingList); 
            return stretchingList;
        }else{
            console.error('스트레칭이 없습니다.'); //에러처리 코드가 이게 맞는지 모르겠음. 수정 필요. (0504)
            return [];
        }
    }

    // 카테고리 별 스트레칭 출력
    const showStretchingList = (stretchingList) => { 
        return stretchingList.map((stretching) => (
            <li 
                key={stretching.id}
                className="m-2 w-[160px] h-[180px]">
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
            }else if (prev.length >= 5) {
                alert("최대 5개까지 담을 수 있어요.");
                return prev;
            }
            return [...prev, stretching];
        });
    };
    const showSelectedStretchingList = () => {
        return selectedStretchingList.map((stretching) => (
            <li key={stretching.id}
                className="selectedStretching flex items-center w-[90%] h-[44px] pl-4 pt-2 pb-2 pr-4 mt-2 z-10 bg-[#F1E9E9] hover:bg-[#beb5b4] rounded-3xl font-semibold text-[#786B5D]"
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
            console.log("스트레칭 id:", selectedStretchingIds); //ok
            setStretchingOrder(selectedStretchingIds); //동적 라우터 생성.
 
            setCompletedStretchings([]); // 완료 모달창에서 이전에 했던 스트레칭 목록도 같이 나와서 시작전에 배열을 비움
            navigate(`/guide/video/${selectedStretchingIds[0]}`); //첫번째 스트레칭 가이드 영상 화면으로 이동.
        }
    }

    // 스트레칭 랜덤 선택 기능
    const handleDiceClick = () => {
        setRandomGuideSelect(prev => prev + 1); // 카운트 증가 함수
    };

    // 스트레칭 전체 정보 불러오기
    useEffect(() => {
        fetch('http://localhost:8000/poses', {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
        })
        .then((res) => {
                if (!res.ok) {
                    throw new Error('서버 응답 실패');
                }
                return res.json();
                })
                .then((data) => {
                    setAllStretchingList(data);
                    console.log('전체 스트레칭 목록:', data);
                })
                .catch((error) => {
                    console.error('스트레칭 목록 불러오기 실패:', error);
                });
    }, []);

    // 스트레칭 랜덤 선택 함수
    const randomhandleStrechingSelect = (allStretching) =>{
        if (allStretching.length === 0) {
            alert("스트레칭 목록이 없습니다.");
            return;
        }

        // 1~5 사이의 무작위
        const count = Math.floor(Math.random() * 5) + 1;

        // 스트레칭 목록을 무작위로 섞고 앞에서 count개 선택
        const shuffled = [...allStretching].sort(() => Math.random() - 0.5);
        const randomSelection = shuffled.slice(0, count).map((s) =>({
            ...s,
            id: s.pose_id,
        }));
        console.log("랜덤 선택 스트레칭:", randomSelection);

        // 기존 리스트 초기화 후 랜덤 스트레칭 담기
        setSelectedStretchingList(randomSelection);
    };

    useEffect(() => {
        if (randomGuideSelect > 0) {
            randomhandleStrechingSelect(allStretchingList);
        }
    }, [randomGuideSelect]);


    // 즐겨찾기
    const favGuideSelect = () =>{
        // 만약 selectFav 가 true면
        // 지금 있는 해당 리스트들을 '내 스트레칭' 카테고리로 넣기
        // 리스트가 없다면 alert 창
        if(selectFav == true){
            if (selectedStretchingList.length === 0) {
                alert("스트레칭이 없습니다.");
                return;
            }
            
            // 기존 즐겨찾기 불러오기
            const prev = JSON.parse(localStorage.getItem("myStretchings")) || [];

            // 중복 제거 (id 기준)
            const newList = [...prev, ...selectedStretchingList].filter(
            (pose, index, self) =>
                index === self.findIndex(p => p.id === pose.id)
            );

            localStorage.setItem("myStretchings", JSON.stringify(newList));
            console.log("저장완료")

        }
    };
    useEffect(() => {
        if (selectFav === true) {
            favGuideSelect();
        }
    }, [selectFav]);

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
                    <ul className="stretchingList p-2 flex flex-wrap items-start">
                        {showStretchingList(stretchingList)} 
                    </ul>
                </div>
                <div className="selectedPart w-[30%]">
                    <div className="flex flex-row justify-between">
                        <h1 className="mb-4 font-semibold text-xl text-[#522B2B]">담긴 스트레칭</h1>
                        <div className="flex flex-row pr-9 gap-4">
                            {/* 즐겨찾기 */}
                            <div onClick={() => setSelectFav(prev => !prev)} 
                            className="w-[33px] h-[33px] rounded-full border border-[#B7AEAE] flex items-center justify-center cursor-pointer text-[20px] text-[#B7AEAE]">
                                {selectFav === true ? "★" : "☆"}</div>
                            {/* 랜덤루틴 */}
                            <div onClick={handleDiceClick} className="w-[33px] h-[33px] border border-[#B7AEAE] rounded-full flex items-center justify-center cursor-pointer">
                                <img src={dice} className="w-[20px] h-[20px]"></img>
                            </div>
                        </div>
 
                    </div>
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


