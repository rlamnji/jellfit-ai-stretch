// 모달 로직 (통합)
import StretchCompleteModal from "./stretch_complete_modal";
import CharacterGetModal from "./character_get_modal";
import StretchQuitModal from "./stretch_quit_modal";

export default function ModalManager({ modalType, setModalType, completedStretchings }) {
  return (
    <>
      {modalType === "complete" && (
        <StretchCompleteModal completedStretchings={completedStretchings}
          onClose={() => {
            //if (hasJelly) setModalType("getJelly");
            setModalType(null);
          }}
        />
      )}
      {modalType === "getJelly" && (
        <CharacterGetModal onClose={() => setModalType(null)} />
      )}
      {modalType === "confirmQuit" && (
        <StretchQuitModal onClose={() => setModalType(null)} />
      )}
    </>
  );
}