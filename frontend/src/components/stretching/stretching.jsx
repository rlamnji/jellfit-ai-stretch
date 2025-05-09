function Stretching ({stretching, onClick}){
    return (
        <button className="flex flex-col items-center mt-8 ml-4 mb-4 w-[160px] h-[180px] rounded-2xl shadow-lg bg-white hover:bg-gray-400"
            onClick={() => onClick(stretching)} //stretching 명시적 전달
        >
            <img src={stretching.imageURL} alt="스트레칭 썸네일" className="w-[140px] h-[100px] mt-2 rounded-lg" />
            <h1 className="m-3 font-semibold">{stretching.name}</h1>
        </button>
    );
}
export default Stretching;