import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom, joinRoom } from '../api'

const FRANCHISES = [
  { name: 'CSK', fullName: 'Chennai Super Kings', color: '#FFCB05' },
  { name: 'MI', fullName: 'Mumbai Indians', color: '#004BA0' },
  { name: 'RCB', fullName: 'Royal Challengers Bengaluru', color: '#EC1C24' },
  { name: 'KKR', fullName: 'Kolkata Knight Riders', color: '#3A225D' },
  { name: 'DC', fullName: 'Delhi Capitals', color: '#004C93' },
  { name: 'PBKS', fullName: 'Punjab Kings', color: '#DD1F2D' },
  { name: 'RR', fullName: 'Rajasthan Royals', color: '#EA1A85' },
  { name: 'SRH', fullName: 'Sunrisers Hyderabad', color: '#FF822A' },
  { name: 'GT', fullName: 'Gujarat Titans', color: '#1C1C1C' },
  { name: 'LSG', fullName: 'Lucknow Super Giants', color: '#A72056' },
];

export default function Home() {
  const nav = useNavigate();
  const [tab, setTab] = useState('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [franchise, setFranchise] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Enter your name');
    const { room } = await createRoom(name);
    localStorage.setItem('session', JSON.stringify({ roomCode: room.code, isHost: true, name }));
    nav(`/lobby/${room.code}`);
  };

  const handleJoin = async () => {
    if (!name.trim() || !code.trim() || !franchise) return setError('Fill all fields');
    const res = await joinRoom(code.toUpperCase(), name, franchise);
    if (res.error) return setError(res.error);
    localStorage.setItem('session', JSON.stringify({ roomCode: code.toUpperCase(), isHost: false, name, teamId: res.team.id, franchise }));
    nav(`/lobby/${code.toUpperCase()}`);
  };

  return (
    <div className="text-center mt-2">
      <h1 style={{ fontSize: '2.5rem' }}>🏏 IPL Auction</h1>
      <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>Create or join an auction room</p>

      <div className="flex mt-2" style={{ justifyContent: 'center' }}>
        <button className={tab === 'create' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setTab('create'); setError(''); }}>
          Host Auction
        </button>
        <button className={tab === 'join' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setTab('join'); setError(''); }}>
          Join Room
        </button>
      </div>

      <div className="card mt-2" style={{ maxWidth: 450, margin: '1rem auto' }}>
        {tab === 'create' ? (
          <div className="flex-col">
            <input placeholder="Your name (Auctioneer)" value={name} onChange={e => setName(e.target.value)} />
            <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>You'll be the auctioneer — you control the auction flow</p>
            <button className="btn-primary mt-1" onClick={handleCreate}>Create Auction Room</button>
          </div>
        ) : (
          <div className="flex-col">
            <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Room code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} />
            <select value={franchise} onChange={e => setFranchise(e.target.value)}>
              <option value="">Pick a franchise</option>
              {FRANCHISES.map(f => (
                <option key={f.name} value={f.name}>{f.name} — {f.fullName}</option>
              ))}
            </select>
            <button className="btn-primary mt-1" onClick={handleJoin}>Join Room</button>
          </div>
        )}
        {error && <p style={{ color: 'var(--ipl-accent)', marginTop: '0.5rem' }}>{error}</p>}
      </div>
    </div>
  );
}
