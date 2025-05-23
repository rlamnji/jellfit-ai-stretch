import { XCircle, Home, CameraOff } from "lucide-react";

function PostureToolbar({ onExit, onBackToMain, onStopCamera }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-black bg-opacity-60 text-white flex justify-center items-center gap-6 py-3 z-50 shadow-md">
      
      {/* 종료하기 */}
      <button
        onClick={onExit}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-sm font-semibold"
      >
        <XCircle size={18} />
        종료하기
      </button>

      {/* 메인으로 */}
      <button
        onClick={onBackToMain}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-semibold"
      >
        <Home size={18} />
        메인으로
      </button>

      {/* 카메라 끄기 */}
      <button
        onClick={onStopCamera}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-full text-sm font-semibold"
      >
        <CameraOff size={18} />
        카메라 끄기
      </button>

    </div>
  );
}

export default PostureToolbar;
