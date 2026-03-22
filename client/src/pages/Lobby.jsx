import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoom, getPlayers } from '../api'
import { socket } from '../socket'

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

const formatPrice = (lakhs) => lakhs >= 100 ? `₹${(lakhs / 100).toFixed(2)} Cr` : `₹${lakhs}L`;
const ROLE_LABEL = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicketkeeper' };

export default function Lobby() {
  const { code } = useParams();
  const nav = useNavigate();
  const [room, setRoom] = useState(null);
  const [showPlayers, setShowPlayers] = useState(false);
  const [sets, setSets] = useState({});
  const session = JSON.parse(localStorage.getItem('session') || '{}');

  const fetchRoom = async () => {
    const r = await getRoom(code);
    if (r.error) return;
    setRoom(r);
    if (r.status === 'live') nav(`/auction/${code}`);
  };

  useEffect(() => {
    fetchRoom();
    socket.connect();
    socket.emit('join-room', { roomCode: code, teamId: session.teamId });
    socket.on('auction-started', () => nav(`/auction/${code}`));
    const interval = setInterval(fetchRoom, 3000);
    return () => { clearInterval(interval); socket.off('auction-started'); };
  }, [code]);

  const handleStart = () => socket.emit('start-auction', { roomCode: code });

  const handleShowPlayers = () => {
    if (!showPlayers && Object.keys(sets).length === 0) {
      getPlayers().then(setSets);
    }
    setShowPlayers(!showPlayers);
  };

  if (!room) return <p className="text-center mt-2">Loading room...</p>;

  return (
    <div className="mt-2">
      <div className="flex-between">
        <h1>🏏 Auction Lobby</h1>
        <div className="card" style={{ padding: '0.5rem 1rem' }}>
          Room Code: <span style={{ color: 'var(--ipl-gold)', fontSize: '1.3rem', fontWeight: 700 }}>{code}</span>
        </div>
      </div>

      <p className="mt-1" style={{ opacity: 0.7 }}>Share the room code with your friends. Host: {room.hostName}</p>

      <h2 className="mt-2">Teams Joined ({room.teams.length}/{room.maxTeams})</h2>
      <div className="grid grid-2 mt-1">
        {room.teams.map(t => {
          const fr = FRANCHISES.find(f => f.name === t.name);
          return (
            <div key={t.id} className="card flex" style={{ borderLeft: `4px solid ${fr?.color || '#555'}` }}>
              <div>
                <strong style={{ color: fr?.color }}>{t.name}</strong> — {fr?.fullName}
                <br /><span style={{ opacity: 0.7 }}>Owner: {t.ownerName}</span>
                <br /><span style={{ opacity: 0.7 }}>Purse: ₹{(t.purse / 100).toFixed(1)} Cr</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex mt-2" style={{ justifyContent: 'center', gap: '1rem' }}>
        {session.isHost && (
          <button className="btn-primary" onClick={handleStart} disabled={room.teams.length < 2}
            style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
            🚀 Start Auction {room.teams.length < 2 ? '(Need 2+ teams)' : ''}
          </button>
        )}
        <button className="btn-secondary" onClick={handleShowPlayers} style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
          {showPlayers ? '✕ Hide Players' : '📋 View All Players'}
        </button>
      </div>

      {/* All Players by Set */}
      {showPlayers && (
        <div className="card mt-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <h2>All Players by Set</h2>
          {Object.entries(sets).map(([setNum, setData]) => (
            <details key={setNum} style={{ marginTop: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: 'var(--ipl-gold)' }}>
                Set {setNum}: {setData.name} ({setData.players.length} players)
              </summary>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.3rem', padding: '0.5rem 1rem' }}>
                {setData.players.map(p => (
                  <div key={p.id} style={{ fontSize: '0.85rem', padding: '0.2rem 0' }}>
                    {p.name} <span style={{ opacity: 0.6 }}>({ROLE_LABEL[p.role]}, {p.nationality})</span> — {formatPrice(p.basePrice)}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
