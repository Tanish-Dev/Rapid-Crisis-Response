import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getToken } from 'firebase/messaging'

import { auth, messaging } from '../firebase'
import { api } from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const { getFirestore, doc, getDoc } = await import('firebase/firestore')
      const { default: app } = await import('../firebase')
      const db = getFirestore(app)
      const userDoc = await getDoc(doc(db, 'users', credential.user.uid))
      const role = userDoc.exists() ? userDoc.data().role || 'general' : 'general'

      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted' && messaging) {
          const fcmToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          })
          await api.post('/api/register-device', {
            role,
            fcm_token: fcmToken,
          })
        }
      } catch (fcmError) {
        console.warn('FCM registration skipped:', fcmError)
        // Do not block login if FCM fails — auth succeeded
      }
    } catch (authError) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .login-page-container {
          display: flex;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #0c0c0c;
        }
        
        .left-panel {
          display: none;
        }

        @media (min-width: 768px) {
          .left-panel {
            display: flex;
            flex: 1;
            margin: 28px;
            border-radius: 20px;
            background: 
              radial-gradient(circle at 10% 10%, #4facfe 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, #00f2fe 0%, transparent 45%),
              radial-gradient(circle at 50% 50%, #90e0ef 0%, transparent 60%),
              #bcedf6;
            position: relative;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px;
            box-sizing: border-box;
            overflow: hidden;
          }
        }

        .pattern-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(#000000 1.5px, transparent 1.5px);
          background-size: 12px 12px;
          opacity: 0.04;
          mix-blend-mode: color-burn;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #111;
          z-index: 1;
        }

        .brand-icon {
          width: 34px;
          height: 34px;
          background-color: #111;
          border-radius: 8px;
          display: grid;
          place-items: center;
        }

        .brand-icon-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
        }

        .brand-icon-inner div {
          width: 6px;
          height: 6px;
          background-color: #fff;
          border-radius: 1.5px;
        }
        
        /* Make bottom right square slightly different to match the abstract logo style */
        .brand-icon-inner div:nth-child(4) {
          opacity: 0.5;
        }

        .left-text {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          color: #111;
          max-width: 80%;
          z-index: 1;
          letter-spacing: -0.03em;
        }

        .right-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 24px;
        }

        .form-container {
          width: 100%;
          max-width: 360px;
        }

        .title {
          color: #ffffff;
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 32px;
          letter-spacing: -0.03em;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .input-field {
          width: 100%;
          box-sizing: border-box;
          background-color: #1a1a1c;
          border: 1px solid #2a2a2c;
          color: #ffffff;
          border-radius: 12px;
          padding: 16px 16px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-field::placeholder {
          color: #71717a;
        }

        .input-field:focus {
          border-color: #52525b;
        }

        .btn-primary {
          width: 100%;
          background-color: #ffffff;
          color: #000000;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          justify-content: center;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #71717a;
          font-size: 0.85rem;
          margin: 24px 0;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #2a2a2c;
        }

        .divider:not(:empty)::before {
          margin-right: 16px;
        }

        .divider:not(:empty)::after {
          margin-left: 16px;
        }

        .btn-guest {
          width: 100%;
          background-color: #1a1a1c;
          color: #ffffff;
          border: 1px solid #2a2a2c;
          border-radius: 12px;
          padding: 16px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-guest:hover {
          background-color: #27272a;
        }

        .links-container {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #a1a1aa;
        }

        .link {
          color: #818cf8;
          cursor: pointer;
          text-decoration: none;
          font-weight: 500;
        }
        
        .link:hover {
          text-decoration: underline;
        }

        .error-message {
          color: #f87171;
          font-size: 0.9rem;
          margin-top: -12px;
          margin-bottom: 16px;
          text-align: center;
        }
      `}</style>
      <div className="login-page-container">
        <div className="left-panel">
          <div className="pattern-overlay"></div>
          <div className="brand-logo">
            <div className="brand-icon">
              <div className="brand-icon-inner">
                <div></div><div></div><div></div><div></div>
              </div>
            </div>
            Crisis Response
          </div>
          <div className="left-text">
            Intelligent<br />emergency & AI
          </div>
        </div>

        <div className="right-side">
          <div className="form-container">
            <h1 className="title">Sign in</h1>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="divider">or</div>

            <button
              type="button"
              onClick={() => navigate('/guest')}
              className="btn-guest"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Guest Access
            </button>

            <div className="links-container">
              <a href="#" className="link">Forgot password?</a>
              <div>No account? <a href="#" className="link">Sign up</a></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
