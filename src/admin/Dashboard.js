import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Panel de Administración</h1>

      <div style={styles.grid}>
        <Card title="Crear rifa" to="/admin/crear" />
        <Card title="Gestionar rifas" to="/admin/rifas" />
        <Card title="Estadísticas" to="/admin/estadisticas" />
        <Card title="Compras" to="/admin/compras" />

      </div>
    </div>
  )
}

function Card({ title, to }) {
  return (
    <Link to={to} style={styles.card}>
      <h3>{title}</h3>
    </Link>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginTop: 20
  },
  card: {
    padding: 30,
    background: '#f1f1f1',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#000',
    borderRadius: 8,
    fontWeight: 'bold'
  }
}

