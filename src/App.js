import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home"

function App() {
  return (
    <div className='w-screen min-h-screen bg-richblack-900 flex-col font-inter'>
      {/* Under BrowserRouter, there is "Routes" then under that there are many individual "Route" */}
      <Routes>
        <Route path='/' element={<Home/>}/>
      </Routes>
    </div>
  );
}

export default App;
