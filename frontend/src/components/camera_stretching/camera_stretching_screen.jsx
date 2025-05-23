import { useState } from "react";
import CameraStretchingConsent from "./camera_stretching_consent";
import CameraStretchingCapture from "./camera_stretching_capture";

function CameraStretchingScreen({ handleIsStretching, sendFrameTime, stretchingId }) {
  const [allowed, setAllowed] = useState(false);

  return (
    <>
      {allowed ? (
        <CameraStretchingCapture handleIsStretching={handleIsStretching} sendFrameTime={sendFrameTime} stretchingId={stretchingId}/>
      ) : (
        <CameraStretchingConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraStretchingScreen;


