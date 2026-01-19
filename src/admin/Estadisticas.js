import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import '../styles/estadisticas.css'

export default function Estadisticas() {
  const [stats, setStats] = useState({
    rifas: 0,
    rifasActivas: 0,
    rifasFinalizadas: 0,
    compras: 0,
    ingresos: 0
  })

  useEffect(() => {
    const cargar = async () => {
      const rifasSnap = await getDocs(collection(db, 'rifas'))
      const comprasSnap = await getDocs(collection(db, 'compras'))

      // 🔹 MAPA DE PRECIOS POR RIFA
      const preciosPorRifa = {}
      let activas = 0
      let finalizadas = 0

      rifasSnap.docs.forEach(d => {
        const r = d.data()
        preciosPorRifa[d.id] = r.precioNumero || 0

        if (r.estado === 'activa') activas++
        if (r.estado === 'finalizada') finalizadas++
      })

      let ingresos = 0
      let comprasAprobadas = 0

      comprasSnap.docs.forEach(d => {
        const c = d.data()
        if (c.estado === 'aprobado') {
          ingresos += preciosPorRifa[c.rifaId] || 0
          comprasAprobadas++
        }
      })

      setStats({
        rifas: rifasSnap.size,
        rifasActivas: activas,
        rifasFinalizadas: finalizadas,
        compras: comprasAprobadas,
        ingresos
      })
    }

    cargar()
  }, [])

  return (
    <div className="stats-container">
      <h2>📊 Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>🎟 Rifas</h3>
          <p>{stats.rifas}</p>
        </div>

        <div className="stat-card activa">
          <h3>🟢 Activas</h3>
          <p>{stats.rifasActivas}</p>
        </div>

        <div className="stat-card finalizada">
          <h3>🔴 Finalizadas</h3>
          <p>{stats.rifasFinalizadas}</p>
        </div>

        <div className="stat-card">
          <h3>🛒 Compras aprobadas</h3>
          <p>{stats.compras}</p>
        </div>

        <div className="stat-card dinero">
          <h3>💰 Ingresos</h3>
          <p>${stats.ingresos.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}


