import img from "../../assets/images/etc/character.png";
function ConnectedJellyfish(){
    const canGetJellyfishTime = '4분 3초';
    const jellyfishName = '한입 베어물은 해파리';
    const jellyfishDetail = `앞으로 ${canGetJellyfishTime} 더 하면 소통 가능해요`;
    return(
        <div className="flex items-center ">
            <div className="jellyfishImg">
                <img src={img} alt="해파리사진" />
            </div>
            <div className="jellyfishInfo">
                <div className="jellyfishName">{jellyfishName}</div>
                <div className="jellyfishDetail">{jellyfishDetail}</div>
            </div>
        </div>
    );
}
export default ConnectedJellyfish;