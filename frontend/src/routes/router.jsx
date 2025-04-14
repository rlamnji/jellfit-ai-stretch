import { BrowserRouter, Route, Routes } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/login/login_page';
import HomePage from '../pages/home/home_page';
import JoinPage from '../pages/join/join_page';
import ConditionPage from '../pages/condition/condition_page';
import FriendPage from '../pages/home/dash_board/friend_page';
import CollectPage from '../pages/home/dash_board/collect_page';
import UserProfilePage from '../pages/home/user_profile_page';
import GuideByBodyPage from "../pages/guide/guide_by_body";
import GuideBySituationPage from "../pages/guide/guide_by_situation";
import DiaryPage from "../pages/diary/diary_page";

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                {/* 로그인과 회원가입 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/condition" element={<ConditionPage />} />
                
                {/* 홈화면 */}
                <Route path="/home" element={<HomePage />} /> 
                <Route path="/home/friends" element={<FriendPage />} />
                <Route path="/home/collection" element={<CollectPage />} />
                <Route path="/home/userProfile" element={<UserProfilePage />} />

                {/* 가이드 화면 */}
                <Route path="/guide/body" element={<GuideByBodyPage />} />
                <Route path="/guide/situation" element={<GuideBySituationPage />} />
            
                    
                {/* 일지 화면 */}   
                <Route path="/diary" element={<DiaryPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default Router;