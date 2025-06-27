// 캐릭터 획득 모달
// 획득하면 저거 세트로 저장해서 사용자 캐릭터 테이블에 업뎃해야함
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import stretchModal from '../../../assets/images/icons/setting_content.png'

function CharacterModal({pendingJelly, onClose}){
    const navigator = useNavigate();
    const [character, setCharacter] = useState([]);
    const [current, setCurrent] = useState(0);

    const token = sessionStorage.getItem("accessToken");

    // pendingJelly의 배열을 검사하며 해당 아이디의 캐릭터 정보를 가져올 것
    // 아이디 보내서 캐릭터 조회하고 내용 반환

    useEffect(() => {
        const fetchCharacters = async () => {
            const res = await fetch("http://localhost:8000/characters/by-ids", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({pendingJelly: pendingJelly}),
            });

            const data = await res.json();
            setCharacter(data);
            console.log("받은 캐릭터 정보:", data);
        };

        if (pendingJelly?.length > 0) {
            fetchCharacters();
        }
    }, [pendingJelly]);

    const nextModal = () =>{
        if (current < character.length - 1){
            setCurrent(prev => prev+1);
        }else{
            onClose();
        }
    };

    const char = character[current];
    if(!char) return null;

    return(
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 z-[9999888] flex justify-center items-center pointer-events-auto">
            <div className="relative overflow-hidden">
                <img src={stretchModal} className="w-[700px] h-[700px] object-contain block"/>

                <div className="flex flex-col absolute top-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='text-[#455970] text-[45px] tracking-widest font-bold'>축하드립니다!</div>
                    <div className='text-[#506175] text-[27px] mt-2'>
                        해파리획득!
                    </div>
                    <div className='bg-[#9299A4] w-[500px] h-[1px] mt-6'></div>
                </div>
                
                
                <div className="abolute z-[1000]">
                    <div className="flex absolute top-52 left-1/2 -translate-x-1/2 p-2 rounded-xl">
                        <div className='bg-[#FFFCFA] w-56 h-56 z-[1000] rounded-2xl items-center'>
                            <img src={char.image_url}/>
                        </div>

                    </div>
                </div>

                <div className="flex flex-col absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] text-center items-center gap-2">
                    <div className='text-[#455970] text-[30px] w-[500px] font-semibold'>{char.name}</div>
                    <div className='text-[#455970] text-[20px] w-[500px] h-24 flex items-center justify-center'>{char.description}</div>
                </div>
                <div className="flex flex-col absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] text-center items-center">
                    <div className='bg-[#D9D5D3] rounded-2xl text-black font-bold p-2 text-[30px] w-[250px] cursor-pointer'
                                    onClick={nextModal}
                    >{current < character.length - 1 ? "다음" : "홈으로"}</div>
                </div>

            </div>
        </div>
    );
}

export default CharacterModal;