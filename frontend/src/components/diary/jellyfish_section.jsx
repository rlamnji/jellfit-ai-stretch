import ConnectedJellyfish from './connected_jellyfish';
function JellyfishSection(){
    return(
        <div>
            <div className="header">
                <h1>말이 통할 듯한 해파리들</h1>
                <p> 스트레칭을 조금만 더 하면<br/>이 해파리들과 말이 통할지도 몰라요!</p>
            </div>
            <div className="jellyfishList">
                {/* 스크롤 구현 */}
                <ConnectedJellyfish/>
                <ConnectedJellyfish/>
                <ConnectedJellyfish/>
            </div>

        </div>
    );
}
export default ConnectedJellyfish;