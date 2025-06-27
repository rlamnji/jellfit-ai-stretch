import BackBtn from '../components/buttons/back_btn';
import SoundBtn from '../components/buttons/sound_btn';

function TopBar(){
    return (
        <div class="w-full h-14 flex justify-between ">
            <BackBtn />
            <SoundBtn />
        </div>
    );
}
export default TopBar;