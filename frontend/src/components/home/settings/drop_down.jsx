// 환경설정 드롭박스 (스트레칭 알림 주기)
// tailwind css 사용

// 현재 선택된 value 의 시간으로 백그라운드 창 띄우기
 
import React, { useState, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { startReminder, stopRepeatingReminder } from '../../../utils/reminder';

import { useReminder } from '../../../context/reminder_context';

function DropDown() {
  
  const options = ['선택','3초', '15초', '20초', '30초'];
  const defaultOption = options[0];

  const { toggledAlarm, reminderDelay, setReminderDelay } = useReminder();

  const getSelectedOption = () => {
    if (!reminderDelay) return defaultOption;
    const seconds = reminderDelay / 1000;
    return `${seconds}초`;
  };

  const handleChange = (option) => {
    const selected = option.value;
    const num = parseInt(selected.match(/\d+/)?.[0], 10);

    if (!num) return;

    let delay = 0;

    if (selected.includes('초')) {
      delay = num * 1000;
    } else if (selected.includes('분')) {
      delay = num * 60 * 1000;
    } else {
      console.warn('지원되지 않는 단위입니다:', selected);
      return;
    }

    setReminderDelay(delay);
  };

  useEffect(() => {
    if (!reminderDelay) return;

    if (toggledAlarm) {
      console.log('알림 시작 - 주기:', reminderDelay, 'ms');
      startReminder(reminderDelay);
    } else {
      console.log('알림 꺼짐');
    }

    return () => stopRepeatingReminder();
  }, [reminderDelay, toggledAlarm]);

  return (
    <div className="flex flex-col items-start text-[14px] font-semibold text-[#333] w-[150px] mx-auto z-[50]">
      <Dropdown
        options={options}
        onChange={handleChange}
        value={getSelectedOption()}
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
