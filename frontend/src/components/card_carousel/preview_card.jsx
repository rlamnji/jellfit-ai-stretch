import img from "../../assets/images/etc/character.png";

function PreviewCard({card}){
    return(
        <div class="bg-white w-[280px] h-[200px] p-4 rounded-lg">
            <div>
                <img src={img} alt="신체부위" />
            </div>
            <div>
                <h1 class="font-bold">{card.name}</h1>
                <div>스트레칭 효과</div>
                <div>{card.effect}</div>
            </div>
        </div>
    );
}
export default PreviewCard;