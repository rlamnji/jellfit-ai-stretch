// 모달 로직 (통합)
import StretchCompleteModal from "./stretch_complete_modal";
import CharacterGetModal from "./character_get_modal";
import StretchQuitModal from "./stretch_quit_modal";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { startCamera } from "../../../utils/cali/camera_on_off";

export default function ModalManager({ modalType, setModalType, completedStretchings, duration, pendingJelly, setPendingJelly, setLeftElapsedTime, setRightElapsedTime, leftElapsedTime, rightElapsedTime, setIsStretchingQuit }) {
  // pendingJelly : 해파리 획득 가능한 해당 캐릭터아이디의 배열
  const navigator = useNavigate();

  useEffect(() => {
    console.log("💡 modalType 변경됨:", modalType);
}, [modalType]);

  
  return (
    <>
      {modalType === "complete" && (
        <StretchCompleteModal completedStretchings={completedStretchings} duration={duration}
          onClose={() => {
            console.log("pendingJelly 상태:", pendingJelly);

            if (pendingJelly?.length > 0) {
              // 캐릭터 있으면 모달 상태 변환
              console.log("캐릭터 획득 모달");
              setModalType("getJelly");
              //setPendingJelly(null);
            } else {
              // 캐릭터 없으면 그냥 종료
              console.log("모달창 종료, 홈으로");
              navigator('/home');
            }
          }}
        />
      )}
      {modalType === "getJelly" && (
        <CharacterGetModal pendingJelly={pendingJelly} onClose={() => navigator('/home')} />
      )}
      {modalType === "confirmQuit" && (
        <StretchQuitModal setLeftElapsedTime={setLeftElapsedTime} setRightElapsedTime={setRightElapsedTime} leftElapsedTime={leftElapsedTime} rightElapsedTime={rightElapsedTime} onClose={() =>  {setIsStretchingQuit(false); setModalType(null);}} />
      )}
    </>
  );
}