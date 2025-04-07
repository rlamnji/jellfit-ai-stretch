function ConnectedJellyfish(){
    canGetJellyfishTime = '4분 3초';
    jellyfishName = '한입 베어물은 해파리';
    jellyfishDetail = `앞으로 ${canGetJellyfishTime}<br/>더 하면 소통 가능해요`;
    return(
        <div>
            <div className="jellyfishImg">
                <img src="../../assets/images/etc/character.png" alt="해파리사진" />
            </div>
            <div className="jellyfishInfo">
                <div className="jellyfishName">{jellyfishName}</div>
                <div className="jellyfishDetail">{jellyfishDetail}</div>
            </div>
        </div>
    );
}
export default ConnectedJellyfish;