import Router from './routes/router';

// 전역 상태 관리
import { ReminderProvider } from './context/reminder_context';
import { SoundProvider } from './context/sound_context';

function App() {
  return (
    <ReminderProvider>
      <SoundProvider>
        <Router />
      </SoundProvider>
    </ReminderProvider>
  );
}

export default App;
