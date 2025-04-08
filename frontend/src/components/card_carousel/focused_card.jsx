function FocusedCard(){
    const body = '몸';
    const diseases = '거북목 / 목디스크 / 역C자목';
    return(
        <div>
            <div>
                <img src="../assets/images/etc/character.png" alt="신체부위" />
            </div>
            <div>
                <h1>{body}</h1>
                <div>관련 질환</div>
                <div>{diseases}</div>
            </div>
        </div>
    );
}
export default FocusedCard;