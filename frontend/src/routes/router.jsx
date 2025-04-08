import { BrowserRouter, Route, Routes } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/login/login_page';
import HomePage from '../pages/home/home_page';
import JoinPage from '../pages/join/join_page';
import ConditionPage from '../pages/condition/condition_page';
import FriendPage from '../pages/dash_board/friend_page';
import CollectPage from '../pages/dash_board/collect_page';

function Router() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<LoginPage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/condition" element={<ConditionPage />} />
                
                {/* 홈화면 */}
                <Route path="/home" element={<HomePage />} /> 
                <Route path="/home/friends" element={<FriendPage />} />
                <Route path="/home/collection" element={<CollectPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Router;