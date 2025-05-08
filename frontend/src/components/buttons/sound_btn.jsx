// 사운드 버튼(BGM)
import { useEffect, useRef, useState } from 'react';
import volumeOn from '../../assets/images/icons/volume_max.png';
import volumeOff from '../../assets/images/icons/volume_x.png';
import track from '../../assets/sounds/track1.mp3';

function SoundBtn(){
    const audio = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() =>{
        const savedSound = localStorage.getItem('isPlaying');
        setIsPlaying(savedSound === 'true');
    },[]);

    useEffect(() => {
        if(audio.current){
            audio.current.muted = isPlaying;
        }
        localStorage.setItem('isPlaying', isPlaying);
    },[isPlaying]);

    return(
        <div class="w-8 h-8 m-4">
            <audio ref={audio} src={track} autoPlay loop />
            <button onClick={() => setIsPlaying((prev) => !prev)}>
                <img src={isPlaying ? volumeOff : volumeOn} alt="사운드버튼" />
            </button>
        </div>
    );
}
export default SoundBtn;