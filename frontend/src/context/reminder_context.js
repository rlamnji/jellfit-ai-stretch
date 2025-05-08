// 전역 상태 관리
// 1. 알람 주기 설정 후 저장하는 상태 ------------ V
// 2. 알람 주기 설정 후 푸시알람 켜는 상태 ------------ V

import { createContext, useContext, useState } from 'react';

const ReminderContext = createContext();

export function ReminderProvider({ children }) {

// 알람 주기 설정 후 저장하는 상태
  const [reminderDelay, setReminderDelay] = useState(null);
  
  // 푸시알람 켰는지 껐는지 관리
  const [toggledAlarm, setToggledAlarm] = useState(true);

  return (
    <ReminderContext.Provider value={{
      reminderDelay,
      setReminderDelay,
      toggledAlarm,
      setToggledAlarm
    }}>
      {children}
    </ReminderContext.Provider>
  );
}

export const useReminder = () => useContext(ReminderContext);
