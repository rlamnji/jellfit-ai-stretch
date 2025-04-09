import sound from '../../assets/images/icons/volume_max.png';

function SoundBtn(){
    return(
        <div>
            <button>
                <img src={sound} alt="뒤로가기버튼" />
            </button>
        </div>
    );
}
export default SoundBtn;