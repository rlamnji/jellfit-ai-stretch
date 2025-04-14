import { useState } from "react";
import CameraConsent from "./camera_consent";
import CameraCapture from "./camera_capture";

function CameraScreen() {
  const [allowed, setAllowed] = useState(false);

  return (
    <>
      {allowed ? (
        <CameraCapture />
      ) : (
        <CameraConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraScreen;
