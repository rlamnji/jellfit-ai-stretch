import TopBar from "../../components/top_bar";
import { Link } from "react-router-dom";
// 동적으로 불러오는 영상이기 때문에, 영상 주소를 props로 받아서 사용해야 함. (미완성)
function WatchGuidePage(){
    return(
        <div className="w-full h-screen flex flex-col items-center bg-space">
            <TopBar />
            <div className="header w-full h-[20%] border-white">
                <Link to='/guide/userStretching' className="flex items-center justify-center w-[100px] h-[40px] bg-[#FBF2E6] font-extrabold text-[#5D3939] rounded-3xl">건너뛰기 ➜</Link>

            </div>
            <iframe src="https://www.youtube.com/embed/RobdPJZAxdM" frameborder="0" className="w-[90%] h-[60%] mt-16"></iframe>

            {/* <div className="videoArea w-[90%] h-[80%] border"></div> */}
        </div>
    );
}
export default WatchGuidePage;