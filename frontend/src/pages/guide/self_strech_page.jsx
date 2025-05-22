
import CameraStretchingScreen from "../../components/camera_stretching/camera_stretching_screen";
import TopBar from "../../components/top_bar";
import SoundBtn from "../../components/buttons/sound_btn";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  startOrResumeSession,
  pauseSession,
  endSession
} from "../../utils/guide_timer";
import arrowLeft from '../../assets/images/icons/arrow_left.png';

import ModalManager from "../../components/stretching/modal/modal_manager";

//좌우 여부 DB에 추가해서 해야하나?
//좌우 여부에 대한 것 아직 반영 안함. 추후 구현 해야 함.
function SelfStretchPage({ stretchingOrder, completedStretchings, setCompletedStretchings }) {

    const navigate = useNavigate();
    const { stretchingId } = useParams();
    const [stretching, setStretching] = useState(null);

    const sendFrameTime = 300; // 0.3초마다 프레임 전송
    const [currentStretchingTime, setCurrentStretchingTime] = useState(0);
    const [isStretching, setIsStretching] = useState(false);
    const [currentRepeat, setCurrentRepeat] = useState(0);

    // 스트레칭 모달
    const [modalType, setModalType] = useState(null); // "complete", "getJelly", "confirmQuit"
    const [hasJelly, setHasJelly] = useState(false);
    const [duration, setDuration] = useState(0);

    const handleIsStretching = (isStretching) => {
        setIsStretching(isStretching);

        if (isStretching) {
        if (stretching?.time != null) {
            setCurrentStretchingTime((prev) => prev + sendFrameTime);
        } else if (stretching?.repeatCount != null) {
            setCurrentRepeat((prev) => prev + 1);
        }
        }
    };

    useEffect(() => {
        startOrResumeSession(); // 시간 측정 시작

        async function fetchStretchingData() {
            const data = await getStretchingData(stretchingId);
            console.log("스트레칭 id", stretchingId)
            console.log("스트레칭 응답 데이터:", data);
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

                console.log("중복 제거된 리스트:", unique);
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
    async function recordUpdate () {
        const res = await fetch("http://localhost:8000/guide/record/accumulate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                "pose_id":stretchingId,
                "repeat_cnt":stretching.repeatCount,
            }),

        });
        if(res.ok){
        const data = await res.json();
        return data
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
            console.log("데이터:", data);
            return data;

        } catch (err) {
            console.error("에러:", err);
            return null;
        }
    }

    return (
        <div className="w-full h-screen flex flex-col items-center bg-space">

        {/*<TopBar/> ==> (05.16_rlamnji) 뒤로가기 컴포에 아예 Link가 있어서 setModalType 설정이 안되더라고!*/}
         <div className='w-full h-14 flex justify-between'>      
            <img src={arrowLeft} className="w-8 h-8 m-4 cursor-pointer" 
                onClick={() => {setModalType('confirmQuit'); }} />
            <SoundBtn />
         </div>
        
        
        <div className="text-xl font-bold mt-4">{stretching.name}</div>

        {stretching.time != null && (
            <>
            <div className="mt-4">현재 시간 / 전체 시간</div>
            <div>
                00 : {Math.floor(currentStretchingTime / 1000)} / 00 :{" "}
                {stretching.time}
            </div>
            </>
        )}

        {stretching.repeatCount != null && (
            <>
            <div className="mt-4">반복 횟수</div>
            <div>
                {currentRepeat} / {stretching.repeatCount}
            </div>
            </>
        )}

        <CameraStretchingScreen
            handleIsStretching={handleIsStretching}
            sendFrameTime={sendFrameTime}
            stretchingId = {stretchingId}
        />

        {/* ✅ 임시용 버튼 */}
        <button
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={async () => {
                const currentIdx = stretchingOrder.indexOf(Number(stretchingId));

                if (currentIdx === stretchingOrder.length - 1) {
                    console.log("모든 완료된 스트레칭:", completedStretchings);
                    const result = endSession(); // 종료 시간 계산
                    console.log("누적 시간", result.duration, "초");
                    setDuration(result.duration); 
                    timeUpdate(result.duration); // 누적 시간 기록 api 호출
                    setModalType("complete"); // 완료 모달 띄우기
                    recordUpdate(); // 누적 횟수 기록 api 호출
                } else {
                    const nextStretchingId = stretchingOrder[currentIdx + 1];
                    navigate(`/guide/video/${nextStretchingId}`);
                }
            }}
            >
            다음으로 넘어가기 (임시)
            </button>

         <ModalManager modalType={modalType} setModalType={setModalType} completedStretchings={completedStretchings} duration={duration}/>
        </div>
        
    );
    }

    export default SelfStretchPage;
