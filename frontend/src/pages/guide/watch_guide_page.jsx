import TopBar from "../../components/top_bar";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// 동적으로 불러오는 영상이기 때문에, 영상 주소를 props로 받아서 사용해야 함. (미완성)
function WatchGuidePage({ stretchingOrder }){
    const { stretchingId } = useParams();
    const [stretching, setStretching] = useState(null);
    useEffect(() => {
        async function fetchStretchingData() {
            const data = await getStretchingData(stretchingId);
            setStretching(data);
        }
        fetchStretchingData();
    }, [stretchingId]);

    async function getStretchingData(stretchingId) {

        const res = await fetch(`http://localhost:8000/guide/stretching/${stretchingId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (res.ok) {
            const stretching = await res.json();
            console.log(stretching);
            return stretching;
        } else {
            console.error('스트레칭이 없습니다.');
            return null;
        }
    }
    if (!stretching) {
        return <div>데이터를 불러오고 있습니다...</div>; // 데이터가 로드될 때까지 로딩 화면 표시
    }


    return(
        <div className="w-full h-screen flex flex-col items-center bg-space">
            <TopBar />
            <div className="header w-full h-[20%] border-white">
                <Link to={`/guide/userStretching/${stretchingId}`} className="flex items-center justify-center w-[100px] h-[40px] bg-[#FBF2E6] font-extrabold text-[#5D3939] rounded-3xl">건너뛰기 ➜</Link>
                {stretching.name}
            </div>
            <iframe src={stretching.videoURL} frameborder="0" className="w-[90%] h-[60%] mt-16"></iframe>

        </div>
    );
}
export default WatchGuidePage;


