import './App.css';
import AppRouter from './router';
import { Toaster } from './components/Toaster';
import { NotificationBell } from './components/notifications';
import { ThemeToggle } from './components';

function App() {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <NotificationBell />
      </div>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;

