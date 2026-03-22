import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../socket'
import { getRoom, getPlayers } from '../api'

const formatPrice = (lakhs) => lakhs >= 100 ? `₹${(lakhs / 100).toFixed(2)} Cr` : `₹${lakhs}L`;
const ROLE_BADGE = { BAT: 'badge-bat', BOWL: 'badge-bowl', ALL: 'badge-all', WK: 'badge-wk' };
const ROLE_LABEL = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicketkeeper' };

function TeamCard({ team, expanded }) {
  const ov = team.soldPlayers?.filter(sp => sp.player.nationality !== 'IND').length || 0;
  const count = team.soldPlayers?.length || 0;
  const byRole = { BAT: [], BOWL: [], ALL: [], WK: [] };
  team.soldPlayers?.forEach(sp => byRole[sp.player.role]?.push(sp));
  return (
    <details open={expanded} style={{ marginBottom: '0.3rem' }}>
      <summary style={{
        cursor: 'pointer', padding: '0.4rem 0.5rem', borderRadius: '6px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div className="flex-between">
          <strong style={{ fontSize: '0.9rem' }}>{team.name}</strong>
          <span style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 700 }}>{formatPrice(team.purse)}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
          <span className="stat-pill"><span className="num">{count}</span>/25 👤</span>
          <span className="stat-pill"><span className="num">{ov}</span>/8 ✈️</span>
        </div>
      </summary>
      <div style={{ padding: '0.2rem 0' }}>
        {count === 0 && <div style={{ opacity: 0.4, fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}>No players yet</div>}
        {['BAT','BOWL','ALL','WK'].map(role => byRole[role].length > 0 && (
          <div key={role}>
            <div style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <span className={`badge ${ROLE_BADGE[role]}`} style={{ fontSize: '0.55rem', padding: '0.08rem 0.35rem' }}>{ROLE_LABEL[role]}s ({byRole[role].length})</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {byRole[role].map(sp => (
                  <tr key={sp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>
                      {sp.player.name}
                      {sp.player.nationality !== 'IND' && <span style={{ marginLeft: '0.2rem', fontSize: '0.65rem' }}>✈️</span>}
                    </td>
                    <td style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: 'var(--green)', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {formatPrice(sp.soldPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </details>
  );
}

export default function Auction() {
  const { code } = useParams();
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  const isHost = session.isHost;

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bid, setBid] = useState(null);
  const [timer, setTimer] = useState(null);
  const [paused, setPaused] = useState(false);
  const [setInfo, setSetInfo] = useState({ name: '', number: 0 });
  const [banner, setBanner] = useState(null);
  const [teams, setTeams] = useState([]);
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [overseas, setOverseas] = useState(false);
  const [sets, setSets] = useState({});
  const [soldIds, setSoldIds] = useState(new Set());
  const [unsoldIds, setUnsoldIds] = useState(new Set());
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [showAllTeams, setShowAllTeams] = useState(false);

  const myTeam = teams.find(t => t.id === session.teamId);
  const refreshTeams = () => getRoom(code).then(r => {
    if (r.teams) setTeams(r.teams);
    if (r.soldPlayers) setSoldIds(new Set(r.soldPlayers.map(sp => sp.playerId)));
  });

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit('join-room', { roomCode: code, teamId: session.teamId });
    refreshTeams();
    getPlayers().then(setSets);

    socket.on('current-player', (data) => {
      setCurrentPlayer(data.player);
      setCurrentPlayerId(data.player.id);
      setBid({ currentBid: null, nextBid: data.basePrice });
      setBanner(null); setTimer(null);
      setSetInfo({ name: data.setName, number: data.setNumber });
      setProgress({ current: data.playerIndex + 1, total: data.totalPlayers });
      setOverseas(data.isOverseas);
    });
    socket.on('bid-update', setBid);
    socket.on('timer-update', ({ seconds }) => setTimer(seconds));
    socket.on('timer-expired', () => setTimer(0));
    socket.on('player-sold', (data) => {
      setBanner({ type: 'sold', teamName: data.teamName, playerName: data.player.name, soldPrice: data.soldPrice, boughtByMe: data.teamId === session.teamId, extra: `Squad: ${data.squadSize}/25 | Overseas: ${data.overseasCount}/8 | Purse: ${formatPrice(data.remainingPurse)}` });
      setSoldIds(prev => new Set([...prev, data.player.id]));
      refreshTeams();
    });
    socket.on('player-unsold', (data) => {
      setBanner({ type: 'unsold', playerName: data.player.name });
      setUnsoldIds(prev => new Set([...prev, data.player.id]));
    });
    socket.on('new-set', (data) => setSetInfo({ name: data.setName, number: data.setNumber }));
    socket.on('pause-update', ({ paused: p }) => setPaused(p));
    socket.on('auction-finished', () => { setFinished(true); refreshTeams(); });
    socket.on('bid-error', ({ message }) => alert(message));
    socket.on('show-teams-update', ({ show }) => setShowAllTeams(show));

    return () => {
      ['current-player','bid-update','timer-update','timer-expired','player-sold','player-unsold','new-set','pause-update','auction-finished','bid-error','show-teams-update'].forEach(e => socket.off(e));
    };
  }, [code]);

  const placeBid = () => socket.emit('place-bid', { roomCode: code });
  const sellPlayer = () => socket.emit('sell-player', { roomCode: code });
  const unsoldPlayer = () => socket.emit('unsold-player', { roomCode: code });
  const nextPlayer = () => socket.emit('next-player', { roomCode: code });
  const togglePause = () => socket.emit('toggle-pause', { roomCode: code });
  const toggleShowTeams = () => {
    const next = !showAllTeams;
    setShowAllTeams(next);
    socket.emit('toggle-show-teams', { roomCode: code, show: next });
  };

  const getPlayerStatus = (p) => {
    if (p.id === currentPlayerId) return '🔴';
    if (soldIds.has(p.id)) return '✅';
    if (unsoldIds.has(p.id)) return '❌';
    return '⬜';
  };

  if (finished) {
    return (
      <div className="mt-2 text-center">
        <h1>🏆 Auction Complete!</h1>
        <div className="grid grid-2 mt-2">
          {teams.map(t => <TeamCard key={t.id} team={t} expanded />)}
        </div>
      </div>
    );
  }

  const hasBid = bid?.currentBid != null;
  const timerDone = timer !== null && timer <= 0;

  return (
    <div className="mt-1">
      {/* Header */}
      <div className="flex-between" style={{ padding: '0.3rem 0' }}>
        <div className="flex">
          <h1 style={{ fontSize: '1.3rem' }}>🏏 {isHost ? 'Auctioneer' : 'Auction'}</h1>
          <span className="stat-pill" style={{ fontSize: '0.8rem' }}>Room: <span className="num">{code}</span></span>
          <span className="stat-pill" style={{ fontSize: '0.8rem' }}>Player <span className="num">{progress.current}/{progress.total}</span></span>
        </div>
        <div className="flex">
          {isHost && (
            <>
              <button className="btn-secondary" onClick={togglePause} style={{ fontSize: '0.8rem' }}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
              <button className={showAllTeams ? 'btn-primary' : 'btn-secondary'} onClick={toggleShowTeams} style={{ fontSize: '0.8rem' }}>
                {showAllTeams ? '🔓 Teams Visible' : '🔒 Teams Hidden'}
              </button>
            </>
          )}
        </div>
      </div>

      {paused && <div className="card mt-1 text-center" style={{ background: '#ff9800', color: '#111', padding: '0.5rem' }}>⏸ AUCTION PAUSED</div>}

      {/* Main 3-column layout */}
      {currentPlayer && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 230px', gap: '0.8rem', marginTop: '0.8rem', position: 'relative' }}>

          {/* LEFT — Teams */}
          <div style={{ maxHeight: '78vh', overflowY: 'auto' }}>
            {isHost ? (
              <>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: 600 }}>ALL TEAMS</div>
                {teams.map(t => <TeamCard key={t.id} team={t} />)}
              </>
            ) : (
              <>
                {myTeam && <TeamCard team={myTeam} expanded />}
                {showAllTeams && (
                  <>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '0.5rem 0 0.3rem', fontWeight: 600 }}>OTHER TEAMS</div>
                    {teams.filter(t => t.id !== session.teamId).map(t => <TeamCard key={t.id} team={t} />)}
                  </>
                )}
              </>
            )}
          </div>

          {/* CENTER — Player + Controls */}
          <div style={{ position: 'relative' }}>
            {/* Banner overlay */}
            {banner && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, width: '90%' }}>
                <div className={banner.type === 'sold' ? 'sold-banner' : 'unsold-banner'}>
                  {banner.type === 'sold' ? (
                    banner.boughtByMe
                      ? <>🎉 CONGRATULATIONS!<br/>{banner.playerName}<br/>{formatPrice(banner.soldPrice)}</>
                      : <>🔨 SOLD!<br/>{banner.playerName}<br/>→ {banner.teamName} for {formatPrice(banner.soldPrice)}</>
                  ) : <>UNSOLD<br/>{banner.playerName}</>}
                  {banner.extra && <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 400 }}>{banner.extra}</div>}
                  {isHost && <div className="mt-1"><button className="btn-secondary" onClick={nextPlayer} style={{ background: 'rgba(0,0,0,0.3)', color: 'inherit', border: 'none' }}>Next Player →</button></div>}
                </div>
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '0.3rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem' }}>Set {setInfo.number}</span>
              <span style={{ color: 'var(--text-dim)', margin: '0 0.4rem' }}>—</span>
              <span style={{ fontSize: '0.9rem' }}>{setInfo.name}</span>
            </div>

            <div className="player-card">
              <h2>{currentPlayer.name}</h2>
              <div style={{ marginTop: '0.4rem', display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className={`badge ${ROLE_BADGE[currentPlayer.role]}`}>{ROLE_LABEL[currentPlayer.role]}</span>
                <span className="badge" style={{ background: 'var(--bg-dark)' }}>{currentPlayer.nationality}</span>
                {overseas && <span className="badge" style={{ background: '#e65100' }}>OVERSEAS</span>}
                {!currentPlayer.isCapped && <span className="badge" style={{ background: '#555' }}>UNCAPPED</span>}
                {currentPlayer.lastTeam && currentPlayer.lastTeam !== '-' && (
                  <span className="badge" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)' }}>Ex: {currentPlayer.lastTeam}</span>
                )}
              </div>

              {currentPlayer.matches > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                  {[
                    { val: currentPlayer.matches, label: 'Mat', color: 'var(--text)' },
                    currentPlayer.runs > 0 && { val: currentPlayer.runs, label: 'Runs', color: 'var(--blue)' },
                    currentPlayer.wickets > 0 && { val: currentPlayer.wickets, label: 'Wkts', color: 'var(--accent)' },
                    currentPlayer.strikeRate > 0 && { val: currentPlayer.strikeRate.toFixed(1), label: 'SR', color: 'var(--gold)' },
                    currentPlayer.economy > 0 && { val: currentPlayer.economy.toFixed(2), label: 'Econ', color: 'var(--gold)' },
                    currentPlayer.average > 0 && { val: currentPlayer.average.toFixed(1), label: 'Avg', color: 'var(--green)' },
                  ].filter(Boolean).map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-dark)', borderRadius: '8px', padding: '0.4rem 0.6rem', textAlign: 'center', minWidth: '55px' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>🆕 IPL Debut</div>
              )}

              <div className="price">
                {hasBid ? formatPrice(bid.currentBid) : formatPrice(currentPlayer.basePrice)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {hasBid ? `Current bid by ${bid.bidderName}` : 'Base Price — Waiting for bids'}
              </div>

              {timer !== null && (
                <div className={`timer-circle ${timer <= 3 && timer > 0 ? 'urgent' : ''} ${timer <= 0 ? 'done' : ''}`}>
                  {timer > 0 ? timer : 'TIME!'}
                </div>
              )}
            </div>

            {/* Bid button */}
            {!isHost && session.teamId && !paused && (
              <div className="text-center mt-1">
                {bid?.bidderId === session.teamId ? (
                  <button className="btn-bid" disabled style={{ opacity: 0.5, background: '#555', color: 'var(--text)' }}>✋ You have the highest bid</button>
                ) : (
                  <button className="btn-bid" onClick={placeBid}>
                    💰 BID {bid?.nextBid ? formatPrice(bid.nextBid) : formatPrice(currentPlayer.basePrice)}
                  </button>
                )}
              </div>
            )}

            {/* Host controls */}
            {isHost && !banner && (
              <div className="flex mt-1" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={unsoldPlayer}>❌ Unsold</button>
                <button className="btn-secondary" onClick={nextPlayer}>⏭ Skip</button>
              </div>
            )}
          </div>

          {/* RIGHT — Set List */}
          <div style={{ maxHeight: '78vh', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: 600 }}>PLAYER SETS</div>
            {Object.entries(sets).map(([setNum, setData]) => {
              const isCurrentSet = parseInt(setNum) === setInfo.number;
              const soldCount = setData.players.filter(p => soldIds.has(p.id)).length;
              const unsoldCount = setData.players.filter(p => unsoldIds.has(p.id)).length;
              const remaining = setData.players.length - soldCount - unsoldCount;
              return (
                <details key={setNum} open={isCurrentSet} style={{ marginBottom: '0.3rem' }}>
                  <summary style={{
                    cursor: 'pointer', padding: '0.4rem 0.5rem', borderRadius: '6px',
                    background: isCurrentSet ? 'rgba(245,197,24,0.1)' : 'var(--bg-card)',
                    border: isCurrentSet ? '1px solid var(--gold)' : '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: isCurrentSet ? 700 : 500, color: isCurrentSet ? 'var(--gold)' : 'var(--text)' }}>
                        {isCurrentSet ? '▶ ' : ''}Set {setNum}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{setData.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.6rem', background: 'rgba(0,230,118,0.15)', color: 'var(--green)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 700 }}>{soldCount}</span>
                      <span style={{ fontSize: '0.6rem', background: 'rgba(233,69,96,0.15)', color: 'var(--accent)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 700 }}>{unsoldCount}</span>
                      <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 700 }}>{remaining}</span>
                    </div>
                  </summary>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.2rem' }}>
                    <tbody>
                      {setData.players.map(p => {
                        const isCurrent = p.id === currentPlayerId;
                        const isSold = soldIds.has(p.id);
                        const isUnsold = unsoldIds.has(p.id);
                        return (
                          <tr key={p.id} style={{
                            background: isCurrent ? 'rgba(245,197,24,0.12)' : 'transparent',
                            opacity: isSold || isUnsold ? 0.5 : 1,
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                          }}>
                            <td style={{ padding: '0.2rem 0.3rem', fontSize: '0.72rem', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--gold)' : 'var(--text)' }}>
                              {p.name}
                              {p.nationality !== 'IND' && <span style={{ marginLeft: '0.2rem', fontSize: '0.65rem' }}>✈️</span>}
                            </td>
                            <td style={{ padding: '0.2rem 0.3rem', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {formatPrice(p.basePrice)}
                            </td>
                            <td style={{ padding: '0.2rem 0.3rem', textAlign: 'right' }}>
                              {isCurrent && <span style={{ fontSize: '0.55rem', fontWeight: 700, background: 'var(--gold)', color: '#111', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>LIVE</span>}
                              {isSold && <span style={{ fontSize: '0.55rem', fontWeight: 700, background: 'rgba(0,230,118,0.2)', color: 'var(--green)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>SOLD</span>}
                              {isUnsold && <span style={{ fontSize: '0.55rem', fontWeight: 700, background: 'rgba(233,69,96,0.2)', color: 'var(--accent)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>UNSOLD</span>}
                              {!isCurrent && !isSold && !isUnsold && <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-dim)', padding: '0.1rem 0.35rem' }}>UPCOMING</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
