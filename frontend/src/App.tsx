import './App.css';
import AppRouter from './router';
import { Toaster } from './components/Toaster';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;

