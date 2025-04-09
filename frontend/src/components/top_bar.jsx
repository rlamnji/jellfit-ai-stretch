import BackBtn from '../components/buttons/back_btn';
import SoundBtn from '../components/buttons/sound_btn';

function TopBar(){
    return (
        <div className="topBar">
        <BackBtn />
        <SoundBtn />
    </div>
    );
}
export default TopBar;