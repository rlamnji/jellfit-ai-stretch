import { useState } from "react";
import CameraConsent from "./camera_consent";
import CameraCapture from "./camera_capture";

function CameraScreen({ handleIsStretching, sendFrameTime }) {
  const [allowed, setAllowed] = useState(false);

  return (
    <>
      {allowed ? (
        <CameraCapture handleIsStretching={handleIsStretching} sendFrameTime={sendFrameTime}/>
      ) : (
        <CameraConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraScreen;
