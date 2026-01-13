import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, rol } = useAuth()
  const navigate = useNavigate()

  const salir = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🎟️ Rifas</Link>

      <div style={styles.links}>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}

        {user && rol === 'admin' && <Link to="/admin">Dashboard</Link>}

        {user && <button onClick={salir}>Salir</button>}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#222',
    color: '#fff'
  },
  logo: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    gap: 15,
    alignItems: 'center'
  }
}
