// 환경설정 드롭박스 (스트레칭 알림 주기)
// tailwind css 사용

// 현재 선택된 value 의 시간으로 백그라운드 창 띄우기
 // 배경음 상태관리랑 브금이랑 묶어야겠덩덩
 
import React, { useState, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { startReminder, stopRepeatingReminder } from '../../../utils/reminder';

import { useReminder } from '../../../context/reminder_context';

function DropDown() {
  
  const options = ['선택','3초', '15초', '20초', '30초'];
  const defaultOption = options[0];
  const [selected, setSelected] = useState(defaultOption);

  const { toggledAlarm, setReminderDelay } = useReminder();

  const handleChange = (option) => {
    console.log('선택된 값:', option.value);
    console.log('알림 상태:', toggledAlarm ? '켜짐' : '꺼짐');
    setSelected(option.value);
  };

  useEffect(() => {
    const minutesOrSeconds = parseInt(selected.match(/\d+/)?.[0], 10);
    if (!minutesOrSeconds) return;

    const isSeconds = selected.includes('초');
    const delay = isSeconds ? minutesOrSeconds * 1000 : minutesOrSeconds * 60 * 1000;

    setReminderDelay(delay);

    if (toggledAlarm) {
      console.log('알림이 켜져 있습니다. 알림을 시작합니다.');
      console.log('알림 주기:', delay, 'ms');
      startReminder(delay);
      
    } else {
      console.log('알림이 꺼짐.');
      return;
    }

    return () => stopRepeatingReminder();
  }, [selected, toggledAlarm]);

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
