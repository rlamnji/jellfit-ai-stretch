import { useState } from "react";
import CameraPostureConsent from "./camera_posture_consent";
import CameraPostureCapture from "./camera_posture_capture";

function CameraPostureScreen() {
  const [allowed, setAllowed] = useState(false);
  const sendFrameTime = 300;

  return (
    <>
      {allowed ? (
        <CameraPostureCapture sendFrameTime={sendFrameTime}/>
      ) : (
        <CameraPostureConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraPostureScreen;