import sound from '../../assets/images/icons/volume_max.png';

function SoundBtn(){
    return(
        <div class="w-8 h-8 m-4 z-10">
            <button>
                <img src={sound} alt="뒤로가기버튼" />
            </button>
        </div>
    );
}
export default SoundBtn;