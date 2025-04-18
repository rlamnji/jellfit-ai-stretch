import { useNavigate } from 'react-router-dom';
import DataSection from '../../components/diary/data_section';
import JellyfishSection from '../../components/diary/jellyfish_section';
import TopBar from '../../components/top_bar';

function DiaryPage(){
    const navigate = useNavigate();
    const strechingTime = '12분 4초';
    return(
        <div className='bg-black w-full h-screen'>
            <TopBar />
            <div className='main flex justify-center items-center'>
                <div className='flex flex-col items-center w-[480px] h-[600px] bg-[#FFF1D5] opacity-80 rounded-[48px]'>
                    <h1 className='m-4 mb-8 font-bold text-4xl text-[#532D2D]'>스트레칭 일지</h1>
                    <div className='contentBox w-[440px] h-[496px] pl-8 pr-8 pt-8 rounded-[48px] border border-[#532D2D]'>
                        <div className='dateSelector flex justify-start'>
                            <div className='font-semibold  text-[#480C0C]'>오늘</div>
                            <div className='text-[#8F8080] ml-8 mr-8'>주</div>
                            <div className='text-[#8F8080]'>월</div>
                        </div>
                        <div className='date mt-4 mb-6 text-xl text-white'>2025년 4월 6일</div>
                        <section className='h-[120px]'>
                            <h1 className='font-bold text-2xl text-[#522B2B] text-opacity-80'>스트레칭 시간</h1>
                            <div className='textLine w-[300px] h-[1px] mt-1 bg-[#D9D9D9]'></div>
                            <div>{strechingTime}</div>
                        </section>
                        <section className='mt-4 h-[200px]'>
                            <h1 className='font-bold text-2xl text-[#522B2B] text-opacity-80'>배운 스트레칭</h1>
                            <div className='textLine w-[300px] h-[1px] mt-1 bg-[#D9D9D9]'></div>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
}
export default DiaryPage;