import img from "../../assets/images/etc/character.png";
function FocusedCard({card}){
    console.log(card);
    return(
        <div className="flex flex-col bg-white w-[300px] h-[280px] p-4 m-4 rounded-3xl">
            <div className="imgArea border-2 rounded-xl">
                <img src={img} alt="신체부위" />
            </div>
            <div>
                <h1 className="mt-2 mb-4 font-semibold text-2xl">{card.name}</h1>
                <div className="mb-1 font-semibold text-md">스트레칭 효과</div>
                <div className="font-medium text-sm text-[#979797]">{card.effect}</div>
            </div>
        </div>
    );
}
export default FocusedCard;