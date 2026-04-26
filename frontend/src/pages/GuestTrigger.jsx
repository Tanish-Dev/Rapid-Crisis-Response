import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const Icons = {
  Medical: () => <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4zm2 0h6V4H9v2zm2 5v2H9v2h2v2h2v-2h2v-2h-2v-2h-2z" /></svg>,
  Fire: () => <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 2c6 4 9 10.5 3.226 15.772.338-.6.54-1.28.54-2.022 0-2.23-1.616-4.076-3.766-4.25-1.127 1.233-1.492 2.766-1.077 4.39A3.498 3.498 0 0 0 12 21.5c1.47 0 2.727-.912 3.25-2.214A7.478 7.478 0 0 1 12 23z" /></svg>,
  Security: () => <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm2.5 1l1.5 1.5-1.5 1.5-1.5-1.5 1.5-1.5z" /></svg>,
  Distress: () => <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-3a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>
};

const ALERT_TYPES = [
  { id: 'medical', color: '#e50000', icon: Icons.Medical },
  { id: 'fire', color: '#ea580c', icon: Icons.Fire },
  { id: 'security', color: '#1e293b', icon: Icons.Security },
  { id: 'distress', color: '#16a34a', icon: Icons.Distress },
];

export default function GuestTrigger() {
  const navigate = useNavigate();
  const [room, setRoom] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(ALERT_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const swipeRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const SWIPE_KNOB_WIDTH = 130;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setRoom('');
        setSelectedAlert(ALERT_TYPES[0]);
        setDragX(0);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const onPointerDown = (e) => {
    if (loading) return;
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging || loading) return;
    const containerWidth = swipeRef.current?.offsetWidth || 300;
    const maxDrag = containerWidth - SWIPE_KNOB_WIDTH - 8;
    let newX = e.clientX - startXRef.current;
    newX = Math.max(0, Math.min(newX, maxDrag));
    setDragX(newX);
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (loading) return;

    const containerWidth = swipeRef.current?.offsetWidth || 300;
    const maxDrag = containerWidth - SWIPE_KNOB_WIDTH - 8;

    if (dragX > maxDrag * 0.9) {
      setDragX(maxDrag);
      handleConfirm();
    } else {
      setDragX(0);
    }
  };

  const handleConfirm = async () => {
    if (!room.trim()) {
      setError('ROOM NO. IS REQUIRED');
      setDragX(0);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/alert', {
        type: selectedAlert.id,
        room: room.trim(),
        device_name: 'guest_web',
        timestamp: new Date().toISOString()
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('FAILED TO SEND ALERT');
      setDragX(0);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#16a34a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 200 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 16px 0' }}>ALERT SENT</h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>HELP IS ON THE WAY</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--red-main)"><path d="M12 2v20m-8.66-5l17.32-10m-17.32 0l17.32 10" stroke="red" strokeWidth="4" strokeLinecap="round" /></svg>
          EMERGENCY CORE
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '2px solid #1e293b', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
        </button>
      </div>

      <div style={{ flex: 1, width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', padding: '0 24px', alignItems: 'flex-start' }}>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '4px 0 8px 0', letterSpacing: '-0.03em', color: '#0f172a' }}>QUICK TRIGGER</h1>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', margin: '0 0 24px 0', letterSpacing: '0.05em' }}>SELECT EMERGENCY CORE TYPE</p>

        {error && <div style={{ width: '100%', background: '#fee2e2', color: 'var(--red-main)', padding: '12px', borderRadius: '8px', fontWeight: 700, textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <input
          type="text"
          placeholder="ROOM NO. (REQUIRED)"
          value={room}
          onChange={(e) => { setRoom(e.target.value); setError(null); }}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid #94a3b8',
            padding: '8px 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '32px',
            outline: 'none',
            textTransform: 'uppercase'
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', marginBottom: '12px' }}>
          {ALERT_TYPES.map(alert => {
            const isSelected = selectedAlert?.id === alert.id;
            const Icon = alert.icon;
            return (
              <button
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '50%',
                  border: 'none',
                  background: isSelected ? alert.color : '#ffffff',
                  color: isSelected ? '#ffffff' : '#27272a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  padding: '24px'
                }}
              >
                <Icon />
              </button>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', width: '100%', marginBottom: '48px' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', letterSpacing: '0.04em', marginBottom: '16px' }}>SWIPE TO CONFIRM CHOICE</p>
          <div
            ref={swipeRef}
            style={{
              position: 'relative',
              background: '#494949ff',
              height: '86px',
              borderRadius: '16px',
              width: '100%',
              overflow: 'hidden',
              border: '10px solid #303030ff',
              padding: '6px'
            }}
          >
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                height: '60px',
                width: `${SWIPE_KNOB_WIDTH}px`,
                background: '#e5e5e5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#0f172a',
                cursor: loading ? 'not-allowed' : 'grab',
                transform: `translateX(${dragX}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                touchAction: 'none'
              }}
            >
              {loading ? '...' : 'CONFIRM'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
