import img from "../../assets/images/etc/character.png";

function PreviewCard({card}){
    return(
        <div class="bg-white w-[280px] h-[200px] p-4 rounded-3xl">
            <div className=" h-fit border-2 rounded-xl mb-2">
                <img className='h-[80px]'src={img} alt="신체부위" />
            </div>
            <div>
                <h1 className="mb-1.5 font-semibold text-lg">{card.name}</h1>
                <div className="mb-1 font-semibold text-sm">스트레칭 효과</div>
                <div className="text-[#979797] text-xs">{card.effect}</div>
            </div>
        </div>
    );
}
export default PreviewCard;