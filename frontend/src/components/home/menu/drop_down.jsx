// 환경설정 드롭박스 (스트레칭 알림 주기)
// tailwind css 사용

// 현재 선택된 value 의 시간으로 백그라운드 창 띄우기
import React, { useState } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

function DropDown() {
  const options = ['30초', '10분', '15분', '20분', '30분'];
  const defaultOption = options[0];
  const [selected, setSelected] = useState(defaultOption);

  const handleChange = (option) => {
    console.log('선택된 값:', option.value);
    setSelected(option.value);
  };

  // selected 값에서 숫자만 추출
  // 값 저장하고 해당 값이 되면 백그라운드 창 띄우기
    const selectedValue = selected.match(/\d+/)[0];
    console.log('선택된 숫자:', selectedValue);

  return (
    <div className="flex flex-col items-start text-[14px] font-semibold text-[#333] w-[150px] mx-auto z-[50]">
      <Dropdown
        options={options}
        onChange={handleChange}
        value={selected}
        placeholder="선택하세요"
        className="w-full"
        controlClassName="bg-[#FFF1D5] border-none rounded-full px-4 py-2 text-[14px] text-[#552F2F] shadow-md"
        menuClassName="bg-white border border-[#ddd] rounded-xl shadow-lg mt-1 overflow-hidden"
        arrowClassName="text-[#552F2F]"
      />
    </div>
  );
}

export default DropDown;
