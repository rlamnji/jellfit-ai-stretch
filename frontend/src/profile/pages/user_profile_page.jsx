// 개인 프로필 수정 화면
// 라이브러리
import { useState } from "react";

// 컴포넌트
import TopBar from "../../common/components/top_bar";
import UserProfile from "../components/user_profile";
import Info from "../components/user_developer";
import PwdModify from "../components/user_pwdmodify";
import Terms from "../components/user_terms";
import DeveloperModal from "../components/user_developer_modal";

// 이미지/에셋
import background from "../../assets/images/etc/basic_background2.png";

function UserProfilePage() {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className="relative w-screen h-screen overflow-hidden">
       <img
          src={background}
          alt="Background"
           className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
       />
        <div className='flex flex-row justify-between'>
          <TopBar/>
        </div>

        <div className="relative w-[1100px] h-[650px] mx-auto flex justify-start items-start">

            <div className="flex justify-end absolute inset-0  top-[300px] left-[650px] pr-5 w-[350px] ">
              <PwdModify />
            </div>

            <div className="flex  absolute inset-0  h-[170px] top-[480px] w-[300px] left-[60px] ">
              <Info setModalOpen={setModalOpen}/>
            </div> 

            <div className="flex  absolute inset-0  h-[170px] top-[290px] w-[300px] left-[60px]">
                <Terms />
            </div>

            <div className="flex  absolute inset-0 ">
                <UserProfile />
            </div>
        </div>
        
        {isModalOpen && (
          <DeveloperModal onClose={() => setModalOpen(false)} />
        )}
    </div>
  );
}

export default UserProfilePage;
