    import CameraStretchingScreen from "../../components/camera_stretching/camera_stretching_screen";
    import TopBar from "../../components/top_bar";
    import { useParams, useNavigate } from "react-router-dom";
    import { useEffect, useState } from "react";

    function SelfStretchPage({ stretchingOrder }) {
    const navigate = useNavigate();
    const { stretchingId } = useParams();
    const [stretching, setStretching] = useState(null);

    const sendFrameTime = 300; // 0.3초마다 프레임 전송
    const [currentStretchingTime, setCurrentStretchingTime] = useState(0);
    const [isStretching, setIsStretching] = useState(false);
    const [currentRepeat, setCurrentRepeat] = useState(0);

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
        async function fetchStretchingData() {
        const data = await getStretchingData(stretchingId);
        console.log("스트레칭 응답 데이터:", data);
        setStretching(data);
        }
        fetchStretchingData();
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

    return (
        <div className="w-full h-screen flex flex-col items-center bg-space">
        <TopBar />
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
        />

        {/* ✅ 임시용 버튼 */}
                <button
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => {
                const currentIdx = stretchingOrder.indexOf(Number(stretchingId));

                if (currentIdx === stretchingOrder.length - 1) {
                navigate("/guide/complete");
                } else {
                const nextStretchingId = stretchingOrder[currentIdx + 1];
                navigate(`/guide/video/${nextStretchingId}`); // ✅ 가이드 영상으로 바로 이동
                }
            }}
            >
            다음으로 넘어가기 (임시)
            </button>
        </div>
    );
    }

    export default SelfStretchPage;
