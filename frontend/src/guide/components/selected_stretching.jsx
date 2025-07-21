import img from "../../assets/images/icons/x.png";
function SelectedStretching({ name, onClick }) {
  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="stretching-name truncate">{name}</div>
      <button className="w-[20px] h-[20px]" onClick={onClick}>
        <img src={img} alt="X 버튼" />
      </button>
    </div>
  );
}
export default SelectedStretching;