import { useState } from "react";
import CameraStretchingConsent from "./camera_stretching_consent";
import CameraStretchingCapture from "./camera_stretching_capture";

function CameraStretchingScreen({ handleIsStretching, sendFrameTime }) {
  const [allowed, setAllowed] = useState(false);

  return (
    <>
      {allowed ? (
        <CameraStretchingCapture handleIsStretching={handleIsStretching} sendFrameTime={sendFrameTime}/>
      ) : (
        <CameraStretchingConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraStretchingScreen;


