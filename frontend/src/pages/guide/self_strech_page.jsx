import CameraScreen from "../../components/camera/camera_screen";
import TopBar from "../../components/top_bar";

function SelfStretchPage() {
    return(
      <div className="w-full h-screen flex flex-col items-center bg-space">
          <TopBar />
          {/* 해당 화면을 벗어날 때 카메라가 꺼지도록 코드 수정해야 함. */}
          <CameraScreen />
          {/* <div className="videoArea w-[90%] h-[80%] border"></div> */}
      </div>
  );
}
export default SelfStretchPage;
    
