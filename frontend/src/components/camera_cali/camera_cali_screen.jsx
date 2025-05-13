import { useState } from "react";
import CameraCaliConsent from "./camera_cali_consent";
import CameraCaliCapture from "./camera_cali_capture";

function CameraCaliScreen() {
  const [allowed, setAllowed] = useState(false);

  return (
    <>
      {allowed ? (
        <CameraCaliCapture />
      ) : (
        <CameraCaliConsent onAllow={() => setAllowed(true)} />
      )}
    </>
  );
}

export default CameraCaliScreen;
