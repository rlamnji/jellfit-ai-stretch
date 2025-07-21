import BackBtn from './back_btn';
import SoundBtn from './sound_btn';

function TopBar(){
    return (
        <div class="w-full h-14 flex justify-between ">
            <BackBtn />
            <SoundBtn />
        </div>
    );
}
export default TopBar;