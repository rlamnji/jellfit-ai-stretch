import TopBar from "../../components/top_bar";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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
            <div className="header p-4 w-full h-[20%] border-white">
                <Link to={`/guide/userStretching/${stretchingId}`} className="flex items-center justify-center w-[100px] h-[40px] bg-[#FBF2E6] font-extrabold text-[#5D3939] rounded-3xl">건너뛰기 ➜</Link>
                <div className="ml-[45%] text-2xl font-extrabold text-[#FBF2E6]">
                    {stretching.name}
                </div>
            </div>
            <iframe src={stretching.videoURL} frameborder="0" className="w-[80%] h-[60%] mt-16 rounded-xl"></iframe>

        </div>
    );
}
export default WatchGuidePage;


