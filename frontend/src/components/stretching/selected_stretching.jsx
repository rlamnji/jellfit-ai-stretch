import img from "../../assets/images/icons/x.png";
function SelectedStretching({ name, onClick }) {
  return (
    <div className="flex items-center justify-between">
      <div className="stretching-name">{name}</div>
      <button className="w-[10%] h-[10%]" onClick={onClick}>
        <img src={img} alt="X 버튼" />
      </button>
    </div>
  );
}
export default SelectedStretching;