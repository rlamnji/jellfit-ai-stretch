function Stretching ({stretching, onClick}){
    return (
        <button className="flex flex-col items-center w-full h-full rounded-2xl hover:bg-[#ECE7E7]"
            onClick={() => onClick(stretching)} //stretching 명시적 전달
        >
            <img
                src={`${stretching.imgURL}.png`}
                alt="스트레칭 썸네일"
                className="w-[140px] h-[100px] mt-2 rounded-lg" 
            />
            <h1 className="m-3 font-semibold">{stretching.name}</h1>
        </button>
    );
}
export default Stretching;