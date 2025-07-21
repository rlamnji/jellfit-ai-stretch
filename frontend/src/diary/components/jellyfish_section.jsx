import ConnectedJellyfish from './connected_jellyfish';

function JellyfishSection(){
    return(
        <div className='w-1/3 h-3/4 mr-5 flex flex-col bg-white rounded-lg'>
            <div className="header">
                <h1 className='font-semibold text-xl'>말이 통할 듯한 해파리들</h1>
                <p className='font-medium text-sm'> 스트레칭을 조금만 더 하면<br/>이 해파리들과 말이 통할지도 몰라요!</p>
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
export default JellyfishSection;