import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './pages/auth/Signup'
import Verify from './pages/auth/Verify'
import Login from './pages/auth/Login'
import Landing from './pages/landing/Landing'
import UserDashboard from './pages/user/UserDashboard'
import SellerDashboard from './pages/seller/SellerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import BidHistory from './pages/seller/BidHistory'
import List from './pages/seller/List'
import Auction from './pages/user/Auction'
import AuctionDetails from './pages/user/AuctionDetails'

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
          <Route path='/user-dashboard' element={<UserDashboard/>} />
          <Route path='/seller-dashboard' element={<SellerDashboard/>} />
          <Route path='/admin-dashboard' element={<AdminDashboard/>} />
          <Route path='/bid-history' element={<BidHistory/>} />
          <Route path='/inventory' element={<List/>} />
          <Route path='/auctions' element={<Auction/>} />
          <Route path='/auction/:id' element={<AuctionDetails/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App