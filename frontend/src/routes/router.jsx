import { BrowserRouter, Route, Routes } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/login/login_page';
import HomePage from '../pages/home/home_page';
import JoinPage from '../pages/join/join_page';
import ConditionPage from '../pages/condition/condition_page';
import ProfilePage from '../pages/user_settings/friend_page';

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* /을 /home으로 바꿈. */}
                <Route path="/home" element={<HomePage />} /> 
                <Route path="/" element={<LoginPage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/condition" element={<ConditionPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Router;