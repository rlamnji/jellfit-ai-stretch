import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import LoginPage from '../pages/login/login_page';
import HomePage from '../pages/home/home_page';
import JoinPage from '../pages/join/join_page';
import ConditionPage from '../pages/condition/condition_page';
import FriendPage from '../pages/home/dash_board/friend_page';
import CollectPage from '../pages/home/dash_board/collect_page';
import UserProfilePage from '../pages/user/user_profile_page';
import DiaryPage from "../pages/diary/diary_page";
import SelectGuidePage from "../pages/guide/select_guide_page";
import SelfStretchPage from "../pages/guide/self_strech_page";
import WatchGuidePage from "../pages/guide/watch_guide_page";
import GuideCompletePage from "../pages/guide/guide_complete_page";
import CalibrationPage from "../pages/join/calibration_page";
import CameraPostureScreen from "../components/camera_posture/camera_posture_screen";
import PostureModeStatePage from "../pages/posture/posture_mode_state_page";

function Router() {
    const [stretchingOrder, setStretchingOrder] = useState([]);
    const [completedStretchings, setCompletedStretchings] = useState([]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />

                {/* 로그인과 회원가입 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/condition" element={<ConditionPage />} />
                <Route path="/condition/:id" element={<CalibrationPage />} />
                
                {/* 홈화면 */}
                <Route path="/home" element={<HomePage />} /> 
                <Route path="/home/friends" element={<FriendPage />} />
                <Route path="/home/collection" element={<CollectPage />} />
                <Route path="/home/userProfile" element={<UserProfilePage />} />

                {/* 가이드 화면 */}
                <Route 
                    path="/guide/select"
                    element={<SelectGuidePage setStretchingOrder={setStretchingOrder} completedStretchings={completedStretchings} setCompletedStretchings={setCompletedStretchings}/>} 
                />
                <Route
                    path="/guide/video/:stretchingId"
                    element={<WatchGuidePage stretchingOrder={stretchingOrder} completedStretchings={completedStretchings} setCompletedStretchings={setCompletedStretchings}/>} 
                />
                {/* 이 라우터는 마지막 페이지를 인식할 수 있도록 해야 함. (수정 필요) */}
                <Route
                    path="/guide/userStretching/:stretchingId"
                    element={<SelfStretchPage stretchingOrder={stretchingOrder} completedStretchings={completedStretchings} setCompletedStretchings={setCompletedStretchings}/>} 
                />
                <Route path="/guide/complete" element={<GuideCompletePage />} /> 
                    
            
                    
                {/* 일지 화면 */}   
                <Route path="/diary" element={<DiaryPage />} />

                {/* 카메라 화면 */}
                <Route path="/camera/posture" element={<CameraPostureScreen />} />

                {/* 자세 교정모드 상태 화면 페이지 */}
                <Route path="/posture/state" element={<PostureModeStatePage />} />


            </Routes>
        </BrowserRouter>
    );
}

export default Router;