function Stretching({ stretching, onClick, mainCategory, onDelete }) {
    return (
        <div className="relative flex flex-col items-center w-full h-full rounded-2xl hover:bg-[#ECE7E7]">
            {/* 삭제 버튼 - 우측 상단 */}
            {mainCategory === '내 스트레칭' && (
                <button 
                    className="absolute top-2 right-2 bg-gray-200 text-xs px-2 py-1 rounded hover:bg-gray-300"
                    onClick={(e) => {
                        e.stopPropagation(); // 부모 버튼 클릭 막기
                        onDelete(stretching);
                    }}
                >
                    삭제
                </button>
            )}

            {/* 본문 클릭 이벤트 유지 */}
            <button
                onClick={() => onClick(stretching)}
                className="flex flex-col items-center w-full h-full"
            >
                <img
                    src={`${stretching.imgURL}.png`}
                    alt="스트레칭 썸네일"
                    className="w-[140px] h-[100px] mt-2 rounded-lg"
                />
                <h1 className="m-3 font-semibold">{stretching.name}</h1>
            </button>
        </div>
    );
}
export default Stretching;
