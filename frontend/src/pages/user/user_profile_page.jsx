// 개인 프로필 수정 화면
import { useState } from "react";
import UserProfile from "../../components/user_profile/user_profile";
import Info from "../../components/user_profile/user_symptom";
import PwdModify from "../../components/user_profile/user_pwdmodify";
import Terms from "../../components/user_profile/user_terms";
import TopBar from "../../components/top_bar";

import BackBtn from "../../components/buttons/back_btn";
import SoundBtn from "../../components/buttons/sound_btn";
import SymptomModal from "../../components/user_profile/user_symptom_modal";

import background from "../../assets/images/etc/basic_background2.png";

function UserProfilePage() {
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
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

        <div className="relative w-[1100px] h-[650px] mx-auto flex justify-start items-start mt-[8vh]">

            <div className="flex justify-end absolute inset-0  top-[320px] left-[650px] pr-5 w-[350px] ">
              <PwdModify />
            </div>

            <div className="flex  absolute inset-0  h-[170px] top-[480px] w-[300px] left-[60px] ">
              <Info setIsSymptomModalOpen={setIsSymptomModalOpen}/>
            </div> 

            <div className="flex  absolute inset-0  h-[170px] top-[300px] w-[300px] left-[60px]">
                <Terms />
            </div>

            <div className="flex  absolute inset-0 ">
                <UserProfile />
            </div>
        </div>
        
        {isSymptomModalOpen && (
          <SymptomModal onClose={() => setIsSymptomModalOpen(false)} />
        )}
    </div>
  );
}

export default UserProfilePage;
