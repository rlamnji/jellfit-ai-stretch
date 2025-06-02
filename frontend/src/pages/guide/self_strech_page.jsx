
import CameraStretchingScreen from "../../components/camera_stretching/camera_stretching_screen";
import playImg from "../../assets/images/icons/play.png";
import questionImg from "../../assets/images/icons/question_mark.png";
import SoundBtn from "../../components/buttons/sound_btn";
import { useParams, useNavigate } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { startOrResumeSession, pauseSession, endSession } from "../../utils/guide_timer";
import arrowLeft from '../../assets/images/icons/arrow_left.png';

import ModalManager from "../../components/stretching/modal/modal_manager";
import LongTimer from "../../components/stretching/long_timer";
import ShortTimer from "../../components/stretching/short_timer";

function SelfStretchPage({ stretchingOrder, completedStretchings, setCompletedStretchings }) {

    const navigate = useNavigate();
    const { stretchingId } = useParams();
    const [stretching, setStretching] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]); // 사용자가 선택한 모든 스트레칭 id 목록

    const sendFrameTime = 300; // 0.3초마다 프레임 전송
    const [currentStretchingTime, setCurrentStretchingTime] = useState(0);
    const [currentRepeat, setCurrentRepeat] = useState(0);

    // 스트레칭 모달
    const [modalType, setModalType] = useState(null); // "complete", "getJelly", "confirmQuit"
    //const [hasJelly, setHasJelly] = useState(false);
    const [duration, setDuration] = useState(0);
    const [pendingJelly, setPendingJelly] = useState(null);

    const [leftElapsedTime, setLeftElapsedTime] = useState(0); // 왼쪽 스트레칭 시간,좌우없으면 왼쪽으로.
    const [rightElapsedTime, setRightElapsedTime] = useState(0); // 오른쪽 스트레칭 시간

    const [isCompleted, setIsCompleted] = useState(false); // 모든 스트레칭 완료 여부




    // 스트레칭 전체 완료할 경우에 대한 처리
    const handleIsCompleted = async (isCompleted) => {
        console.log("모든 스트레칭 완료 여부:", isCompleted);
        if (isCompleted) {
            const currentIdx = stretchingOrder.indexOf(Number(stretchingId));
            // 스트레칭 완료되면 해당 자세 총 시간 계산해서 누적.
            if (currentIdx === stretchingOrder.length - 1) {
            console.log("모든 완료된 스트레칭", completedStretchings);
            const result = endSession(); // 종료 시간 계산
            console.log("현재 누적 시간", result.duration, "초");
            setDuration(result.duration); 

            await timeUpdate(result.duration); // 누적 시간 기록 api 호출
            setModalType("complete"); // 완료 모달 띄우기
            await recordUpdate(completedStretchings); // 누적 횟수 기록 api 호출
            
            const charResult = await checkGetCharacters();
            if (charResult?.unlocked_character_ids?.length > 0) {
                setSelectedIds(charResult.unlocked_character_ids);  
                setPendingJelly(charResult.unlocked_character_ids);
            }

            postCharacters(charResult.unlocked_character_ids);
            } else {
            const nextStretchingId = stretchingOrder[currentIdx + 1];
            navigate(`/guide/video/${nextStretchingId}`);
            }
        }
    };


    useEffect(() => {
        startOrResumeSession(); // 시간 측정 시작

        async function fetchStretchingData() {
            const data = await getStretchingData(stretchingId);
            console.log("스트레칭 id", stretchingId);
            console.log("스트레칭 데이터", data);
            setStretching(data);

            // 스트레칭 응답 데이터가 스트레칭 하나당 각각 들어와서 이를 배열로 묶음
            // 스트레칭 영상 가이드화면과 스트레칭 시작 화면을 왔다갔다 하기때문에 
            // useEffect가 2번씩 호출 되어 중복 제거함
            const already = completedStretchings.find(
                d => d.pose_id === Number(stretchingId)
            );

            if (already) {
                console.log("이미 존재함:", already);
            } else {
            const newItem = {
                name: data.name,
                pose_id: Number(stretchingId),
                repeatCount: data.repeatCount,
            };

            setCompletedStretchings(prev => {
                const withNew = [...prev, newItem];

                // 중복 pose_id 제거
                const unique = withNew.filter(
                    (item, index, self) =>
                    index === self.findIndex(t => t.pose_id === item.pose_id)
                );

                console.log("중복 제거된 리스트", unique);
                return unique;
            });
            }
        }
        fetchStretchingData();

        return () =>{
            pauseSession(); // 페이지 나갈 때 정지
        };
    }, [stretchingId]);

    // 시간이 다 되었을 경우 반복 증가
    useEffect(() => {
        if (stretching && stretching.time != null && stretching.repeatCount != null) {
        if (currentStretchingTime >= stretching.time) {
            setCurrentStretchingTime(0);
            setCurrentRepeat((prev) => prev + 1);
        }
        }
    }, [currentStretchingTime, stretching]);

    // 다음 페이지 이동 조건 처리
    useEffect(() => {
        if (!stretching) return;

        const isRepeatFinished =
        stretching.repeatCount != null && currentRepeat >= stretching.repeatCount;

        const isTimeFinished =
        stretching.repeatCount == null &&
        stretching.time != null &&
        currentStretchingTime >= stretching.time;

        if (isRepeatFinished || isTimeFinished) {
        console.log("스트레칭 종료 또는 다음으로 이동");

        if (stretchingId === stretchingOrder[stretchingOrder.length - 1]) {
            navigate("/guide/complete");
        } else {
            const nextStretchingId =
            stretchingOrder[stretchingOrder.indexOf(stretchingId) + 1];
            navigate(`/guide/userStretching/${nextStretchingId}`);
        }
        }
    }, [currentRepeat, currentStretchingTime, stretching]);

    // 스트레칭 데이터 조회
    async function getStretchingData(stretchingId) {
        const res = await fetch(`http://localhost:8000/guide/stretching/${stretchingId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            const data = await res.json();
            return data;
        } else {
            console.error("스트레칭 데이터를 가져오지 못했습니다.");
            return null;
        }
    }

    if (!stretching) {
        return <div>데이터를 불러오고 있습니다...</div>;
    }

    // 스트레칭 결과 DB에 저장
    async function recordUpdate (completedStretchings) {
        const res = await fetch("http://localhost:8000/guide/record/accumulate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                records: completedStretchings 
            }),

        });
        if(res.ok){
        const data = await res.json();
        console.log("누적 성공(횟수)", data);
        return data;
        } else {
        console.error("스트레칭 데이터를 가져오지 못했습니다.");
        return null;
        }
    }

    // 스트레칭 누적 시간 DB에 저장
    async function timeUpdate(usageTime) {
        try {
            const res = await fetch("http://localhost:8000/guide/time/accumulate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("accessToken")
            },
            body: JSON.stringify({ usage_time: usageTime })
            });

            const data = await res.json();
            console.log("누적 성공(시간)", data);
            return data;

        } catch (err) {
            console.error("에러:", err);
            return null;
        }
    }

    // 스트레칭 완료 후 해파리 획득이 가능한지 조건 검사 후 필터링
     async function checkGetCharacters() {
        try {
            const chekRes = await fetch("http://localhost:8000/guide/available-characters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("accessToken")
            },
            
            });

            const data = await chekRes.json();
            console.log("획득 가능한 캐릭터 내용", data);
            return data;

        } catch (err) {
            console.error("에러:", err);
            return null;
        }
    }

    // 획득 가능해파리를 사용자 해파리 db에 저장
    async function postCharacters(CharacterId) {
        try {
            const chekRes = await fetch("http://localhost:8000/guide/user-characters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("accessToken")
            },
            body: JSON.stringify({ character_id: CharacterId })
            });

            const data = await chekRes.json();
            console.log(data);
            return data;

        } catch (err) {
            console.error("에러:", err);
            return null;
        }
    }

    function handleElapsedTime(currentSide, elapsedTime) {

        if (currentSide === "left") {
            setLeftElapsedTime(elapsedTime);

        } else if (currentSide === "right") {
            setRightElapsedTime(elapsedTime);

        } else { //좌우없는 스트레칭의 경우
            setLeftElapsedTime(elapsedTime);
        }
    }

    const handleNextOrComplete = async () => {
        const currentIdx = stretchingOrder.indexOf(Number(stretchingId));

        if (currentIdx === stretchingOrder.length - 1) {
            console.log("모든 완료된 스트레칭", completedStretchings);
            const result = endSession(); // 종료 시간 계산
            console.log("현재 누적 시간", result.duration, "초");
            setDuration(result.duration); 

            await timeUpdate(result.duration); // 누적 시간 기록 api 호출
            setModalType("complete"); // 완료 모달 띄우기
            await recordUpdate(completedStretchings); // 누적 횟수 기록 api 호출
            
            // 캐릭터 획득 가능한지 조건 검사 api
            const charResult = await checkGetCharacters();
            
            if (charResult?.unlocked_character_ids?.length > 0) {
                setSelectedIds(charResult.unlocked_character_ids);  // pose_id 배열 저장
                console.log("획득 가능한 캐릭터 아이디", charResult.unlocked_character_ids);
                setPendingJelly(charResult.unlocked_character_ids);
            }

            // 캐릭터 등록 api
            postCharacters(charResult.unlocked_character_ids);


        } else {
            const nextStretchingId = stretchingOrder[currentIdx + 1];
            navigate(`/guide/video/${nextStretchingId}`);
        }
    }

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col items-center bg-space">

            <div className='topBar w-full h-14 flex justify-between'>      
                <img src={arrowLeft} className="w-8 h-8 m-4 cursor-pointer" 
                    onClick={() => {setModalType('confirmQuit'); }} />
                <SoundBtn />
            </div>

            <div className="header flex items-center justify-center w-full h-[20%] border-white">
                { stretching.haveDirection ?
                    <LongTimer 
                        className="flex items-center justify-center relative w-[320px] h-[120px]"
                        leftElapsedTime={leftElapsedTime} rightElapsedTime={rightElapsedTime} totalTime={stretching.time}
                    /> 
                    : 
                    <ShortTimer 
                        className="flex items-center justify-center relative w-[240px] h-[144px]"
                        leftElapsedTime={leftElapsedTime} totalTime={stretching.time}
                    />
                }
            </div>
            <div className="main w-full h-full flex items-center justify-center relative pt-2 pb-12 mb-4">

                <CameraStretchingScreen
                    handleIsCompleted={handleIsCompleted}
                    handleElapsedTime={handleElapsedTime}
                    sendFrameTime={sendFrameTime}
                    stretchingId = {stretchingId}
                />

                {/* 임시용 버튼 == 넘어가기> 버튼 */}

                {/* ✅ 임시용 버튼 */}
                {/* 임시용 버튼을 없애고 true --> 끝 --> 모달창 까지 연결해야함*/}
                {/* 로직은 backend */}
                {/* 최종 완료는 true를 받았을 때 / 임시버튼은 현재까지 한대로만 */}

                {/* 서버에서 true를 받았을 시 동작 완료 */}


                <ModalManager modalType={modalType} setModalType={setModalType} completedStretchings={completedStretchings} duration={duration} pendingJelly={pendingJelly} setPendingJelly={setPendingJelly}/>
                <div className="buttonArea w-[56%] h-auto absolute top-5 flex items-center gap-4">
                    <button 
                        className="w-24 h-8 flex items-center justify-center bg-[#FBF2E6] text-[#463C3C] font-semibold rounded-2xl shadow-lg"
                        onClick={()=>{navigate(-1)}}
                    >
                        <img src={playImg} alt="재생버튼 아이콘" className="w-4 h-4 mr-1"/>
                        다시보기
                    </button>
                    <div className="relative group w-24 h-8">
                        <button 
                            className="w-full h-full flex items-center cursor-pointer justify-center bg-[#FBF2E6] text-[#463C3C] font-semibold rounded-2xl shadow-lg"
                            onClick={() => navigate("/condition/:id")}  // 이동 경로 적절히 수정
                        >
                            <img src={questionImg} alt="물음표 아이콘" className="w-4 h-4 mr-1" />
                            인식오류
                        </button>

                        {/* 툴팁 */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-2 leading-relaxed bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            스트레칭 중 자세 인식이 잘 되지 않는다면<br />
                            <b className="text-[16px]">클릭하여 캘리브레이션 화면</b>으로 이동해<br />
                            기준 자세를 다시 맞춰주세요.
                        </div>
                    </div>                    
                    <button 
                        className="w-24 h-8 flex items-center justify-center bg-[#FBF2E6] text-[#463C3C] font-semibold rounded-2xl shadow-lg"
                        onClick= {handleNextOrComplete}
                    >
                        넘어가기 &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}

    export default SelfStretchPage;
