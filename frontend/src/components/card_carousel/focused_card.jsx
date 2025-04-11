import img from "../../assets/images/etc/character.png";
function FocusedCard({card}){
    console.log(card);
    return(
        <div class="bg-white w-[300px] h-[280px] p-4 m-4 rounded-lg flex flex-col">
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
export default FocusedCard;