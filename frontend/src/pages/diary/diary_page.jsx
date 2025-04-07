import DataSection from 
function DiaryPage(){
    return(
        <div>
            <div className="topBar">
                <BackBtn />
                <SoundBtn />
            </div>
            <div className="header">
                <h1>스트레칭 일지</h1>
            </div>
            <div className="main">
                <DataSection />
                <JellyfishSection />
            </div>
        </div>
    );
}
export default DiaryPage;