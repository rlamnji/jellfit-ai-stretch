// 사운드 버튼(BGM)
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import volumeOn from '../../assets/images/icons/volume_max.png';
import volumeOff from '../../assets/images/icons/volume_x.png';
import backgroundMusic from '../../assets/sounds/track1.mp3';

import { useSound } from '../../context/sound_context';
import { playAudio, stopAudio } from '../../utils/sound';

function SoundBtn(){
    const {isPlaying, setIsPlaying} = useSound();

    useEffect(() =>{
        const savedSound = localStorage.getItem('isPlaying');
        if (savedSound !== null) {
            setIsPlaying(savedSound === 'true');
        }
    },[]);

    const handleClose = () =>{
        setIsPlaying(prev => !prev);
    }

    useEffect(() => {
        localStorage.setItem('isPlaying', isPlaying.toString());
        // 이미지가 true일 때만 소리재생
        if(!isPlaying){
            playAudio(backgroundMusic);
        }else{
            stopAudio();
        }
    },[isPlaying]);

    return(
        <div class="w-8 h-8 m-4">
                <button onClick={() => handleClose()}>
                    <img src={isPlaying ? volumeOff : volumeOn} alt="사운드버튼" />
                </button>
        </div>
    );
}
export default SoundBtn;