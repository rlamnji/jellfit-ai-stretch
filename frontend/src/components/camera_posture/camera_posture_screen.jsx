import { useState } from "react";
import CameraPostureConsent from "./camera_posture_consent";
import CameraPostureCapture from "./camera_posture_capture";

function CameraPostureScreen({ handlePostureCode, sendFrameTime }) {
  const [allowed, setAllowed] = useState(false);

  return (
    <>
      {allowed ? (
        <CameraPostureCapture handlePostureCode={handlePostureCode} sendFrameTime={sendFrameTime}/>
      ) : (
        <CameraPostureConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraPostureScreen;


