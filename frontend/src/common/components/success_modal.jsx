import { useEffect, useState } from 'react';

function SuccessModal({ message }) {
  const [isVisible, setIsVisible] = useState(true);      // 나타남 여부
  const [isFading, setIsFading] = useState(false);        // 페이드아웃 여부

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);  // 페이드아웃 시작
    }, 6000); // 6초 뒤

    const hideTimer = setTimeout(() => {
      setIsVisible(false);  // 완전히 제거
    }, 2500); // 페이드아웃 끝난 뒤 제거

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center transition-opacity duration-500 bg-black bg-opacity-50
                  ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="bg-black px-6 py-4 rounded-xl shadow-xl text-white text-lg">
        {message}
      </div>
    </div>
  );
}

export default SuccessModal;
