import CameraStretchingScreen from "../../components/camera_stretching/camera_stretching_screen";
import TopBar from "../../components/top_bar";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

//좌우 여부 DB에 추가해서 해야하나?
//좌우 여부에 대한 것 아직 반영 안함. 추후 구현 해야 함.
function SelfStretchPage({ stretchingOrder }) {
    const navigate = useNavigate();
    const { stretchingId } = useParams();
    const [stretching, setStretching] = useState(null);

    const sendFrameTime = 300; //0.3초마다 프레임 전송
    const [currentStretchingTime, setCurrentStretchingTime] = useState(0);
    const [isStretching, setIsStretching] = useState(false);

    const [currentRepeat, setCurrentRepeat] = useState(0);

    const handleIsStretching = (isStretching) => {
        setIsStretching(isStretching); //지금 스트레칭 중인지 여부 확인.
        if (isStretching) {
            setCurrentStretchingTime((prev) => prev + sendFrameTime);
        }
    };
    useEffect(() => {
        async function fetchStretchingData() {
            const data = await getStretchingData(stretchingId);
            setStretching(data);
        }
        fetchStretchingData();
    }, [stretchingId]);
    
    // 시간 다 채우면 반복 횟수 + 1
    useEffect(() => {
        if (currentStretchingTime >= stretching.time) {
            setCurrentStretchingTime(0); // 시간 초기화
            setCurrentRepeat(prev => prev + 1); // 반복 횟수 증가
        }
    }, [currentStretchingTime, stretching.time]);

    // 반복 횟수 다 채우면 완료 또는 다음으로 이동.
    useEffect(() => {
        if (currentRepeat >= stretching.repeatCount) {
            console.log("스트레칭 종료 또는 다음으로 이동");

            // 스트레칭 완료
            if (stretchingId === stretchingOrder[stretchingOrder.length - 1]) {
                navigate('/guide/complete');
            } else {
                const nextStretchingId = stretchingOrder[stretchingOrder.indexOf(stretchingId) + 1];
                navigate(`/guide/userStretching/${nextStretchingId}`);
            }
        }
    }, [currentRepeat, stretching.repeatCount]); 
    

    async function getStretchingData(stretchingId) {
        const mockData = {
            name: "손목 돌리기",
            videoURL: "https://www.youtube.com/embed/-0nB9SlxzO4",
            time:0,
            repeatCount:5
        };
        return mockData;

        // 서버와 연결 시 아래 코드 사용
        // const res = await fetch(`/guide/stretching/${stretchingId}`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });
        // if (res.ok) {
        //     const { stretching } = await res.json();
        //     return stretching;
        // } else {
        //     console.error('스트레칭이 없습니다.');
        //     return null;
        // }
    }
    if (!stretching) {
        return <div>데이터를 불러오고 있습니다...</div>; // 데이터가 로드될 때까지 로딩 화면 표시
    }
    return(
        <div className="w-full h-screen flex flex-col items-center bg-space">
            <TopBar />
            <div>{stretching.name}</div>
            <div>현재 시간 / 전체 시간</div>
            <div> 00 : {Math.floor(currentStretchingTime)} / 00 : {stretching.time}</div>
            <div>반복 횟수</div>
            <div>{currentRepeat} / {stretching.repeatCount}</div>
            {/* 해당 화면을 벗어날 때 카메라가 꺼지도록 코드 수정해야 함. */}
            <CameraStretchingScreen handleIsStretching={handleIsStretching} sendFrameTime={sendFrameTime}/>
            {/* <div className="videoArea w-[90%] h-[80%] border"></div> */}
        </div>
    );
}
export default SelfStretchPage;


    
