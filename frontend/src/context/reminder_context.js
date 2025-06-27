// 전역 상태 관리
// 1. 알람 주기 설정 후 저장하는 상태 ------------ V
// 2. 알람 주기 설정 후 푸시알람 켜는 상태 ------------ V

import { createContext, useContext, useState } from 'react';

const ReminderContext = createContext();

export function ReminderProvider({ children }) {
  // 알람 주기 → localStorage 연동
  const [reminderDelay, setReminderDelay] = useState(() => {
    return localStorage.getItem('reminderDelay');
  });

  // 푸시 알람 상태 (켜짐/꺼짐) → localStorage 연동
  const [toggledAlarm, setToggledAlarm] = useState(() => {
    const saved = localStorage.getItem('toggledAlarm');
    return saved !== null ? saved === 'true' : true;
  });

  const updateReminderDelay = (value) => {
    setReminderDelay(value);
    localStorage.setItem('reminderDelay', value);
  };

  const updateToggledAlarm = (value) => {
    setToggledAlarm(value);
    localStorage.setItem('toggledAlarm', value.toString());
  };

  return (
    <ReminderContext.Provider value={{
      reminderDelay,
      setReminderDelay: updateReminderDelay,
      toggledAlarm,
      setToggledAlarm: updateToggledAlarm
    }}>
      {children}
    </ReminderContext.Provider>
  );
}

export const useReminder = () => useContext(ReminderContext);

