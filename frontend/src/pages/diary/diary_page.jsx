import { useNavigate } from 'react-router-dom';
import DataSection from '../../components/diary/data_section';
import JellyfishSection from '../../components/diary/jellyfish_section';
import TopBar from '../../components/top_bar';
import background from '../../assets/images/etc/basic_background2.png';
import { useEffect, useState } from 'react';


function DiaryPage(){
    const navigate = useNavigate();
    const strechingTime = '12분 4초';


    //ON! 이거부터 다시 해야됨.
    // useEffect(() => {
    //     const fetchDiaryData = async () => {
    //         const data = await fetchStretchingTimeRecord();
    //         const stretchingTime = data.json(); // 예시, 실제로는 API 응답에서 시간 추출 필요

    //     }
    //     fetchDiaryData();
            
    // }, []);

    // const fetchStretchingTimeRecord = async () => {
    //     fetch('/user/{userId}/stretching/record', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body : {
    //             'date': '2025-04-06', // 예시 날짜, 실제로는 선택된 날짜로 변경 필요
    //         }
    //     })
    // };

    return(
        <div>
            <img
            src={background}
            alt="Background"
            className="fixed top-0 left-0 w-full h-screen object-cover z-[-1]"
            />
            <div className='w-full h-screen'>
                <TopBar />
                <div className='main flex justify-center items-center'>
                    <div className='flex flex-col items-center w-[480px] h-[600px] bg-[#F3F1E6] rounded-[48px]'>
                        <h1 className='m-4 mb-8 font-bold text-4xl text-[#532D2D]'>스트레칭 일지</h1>
                        <div className='contentBox w-[440px] h-[496px] pl-8 pr-8 pt-8 rounded-[48px] border border-[#532D2D]'>

                            <div className='contentBox flex flex-col items-center mt-4'>
                                <button className='date mt-4 mb-6 text-xl text-white'>2025년 4월 6일   ▼</button>
                                <div className='stretchingTimeSection flex flex-col justify-between items-center'>
                                    <div className='font-bold text-2xl text-[#522B2B] text-opacity-80'>총 스트레칭 시간</div>
                                    <div className='textLine w-[300px] h-[1px] mt-1 bg-[#D9D9D9]'></div>
                                    <div className='m-4 text-3xl'>{strechingTime}</div>
                                </div>
                                <div className='stretchingNameSection flex flex-col justify-between items-center mt-8'>
                                    <h1 className='font-bold text-2xl text-[#522B2B] text-opacity-80'>날짜 별 스트레칭 시간</h1>
                                    <div className='textLine w-[300px] h-[1px] mt-1 bg-[#D9D9D9]'></div>
                                    <ul className='stretchingTimeList flex flex-col justify-center border'>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>           
        </div>
    );
}
export default DiaryPage;