import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Auction from './pages/Auction'

export default function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:code" element={<Lobby />} />
        <Route path="/auction/:code" element={<Auction />} />
      </Routes>
    </div>
  )
}
