import './App.css';
import AppRouter from './router';
import { Toaster } from './components/Toaster';
import { NotificationBell } from './components/notifications';

function App() {
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell />
      </div>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;

