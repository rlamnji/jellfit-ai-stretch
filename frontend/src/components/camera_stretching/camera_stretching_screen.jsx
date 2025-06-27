import { useState } from "react";
import CameraStretchingConsent from "./camera_stretching_consent";
import CameraStretchingCapture from "./camera_stretching_capture";

function CameraStretchingScreen({ isStretchingQuit, handleIsCompleted, handleElapsedTime, sendFrameTime, stretchingId }) {
  const [allowed, setAllowed] = useState(false);

  return (
    <>
      {allowed ? (
        <CameraStretchingCapture isStretchingQuit={isStretchingQuit} handleIsCompleted={handleIsCompleted} handleElapsedTime={handleElapsedTime} sendFrameTime={sendFrameTime} stretchingId={stretchingId}/>
      ) : (
        <CameraStretchingConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraStretchingScreen;


