import DataSection from '../../components/diary/data_section';
import JellyfishSection from '../../components/diary/jellyfish_section';
import TopBar from '../../components/top_bar';

function DiaryPage(){
    return(
        <div className='bg-black w-full h-screen'>
            <TopBar />
            <div className="header m-5">
                <h1 className='font-semibold text-4xl text-white '>스트레칭 일지</h1>
            </div>
            <div className="main flex">
                <DataSection />
                <JellyfishSection />
            </div>
        </div>
    );
}
export default DiaryPage;