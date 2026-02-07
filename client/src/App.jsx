import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './pages/auth/Signup'
import Verify from './pages/auth/Verify'
import Login from './pages/auth/Login'
import Landing from './pages/landing/Landing'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/verify" element={<Verify/>} />
          <Route path='/login' element={<Login/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
