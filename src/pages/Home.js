import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { Link } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  const [rifas, setRifas] = useState([])
  const [ultimoGanador, setUltimoGanador] = useState(null)
  const [rifaGanadora, setRifaGanadora] = useState(null)

  useEffect(() => {
    cargarRifas()
    cargarUltimoGanador()
  }, [])

  const cargarRifas = async () => {
    const snap = await getDocs(collection(db, 'rifas'))
    setRifas(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.estado === 'activa')
    )
  }

  const cargarUltimoGanador = async () => {
    const q = query(
      collection(db, 'ganadores'),
      orderBy('creadoEn', 'desc'),
      limit(1)
    )

    const snap = await getDocs(q)
    if (snap.empty) return

    const ganador = snap.docs[0].data()
    setUltimoGanador(ganador)

    const rifasSnap = await getDocs(collection(db, 'rifas'))
    const rifa = rifasSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .find(r => r.id === ganador.rifaId)

    setRifaGanadora(rifa)
  }

  return (
    <div className="home-container">
      <h1 className="home-title">🎟 Rifas disponibles</h1>

      {/* ===== BANNER GANADOR ===== */}
      {ultimoGanador && rifaGanadora && (
        <div className="ganador-banner">
          <h2>🎉 Último ganador</h2>

          <div className="ganador-info">
            <p><b>Rifa:</b> {rifaGanadora.titulo}</p>
            <p><b>Lotería:</b> {rifaGanadora.loteria}</p>
            <p className="numero-ganador">
              🎯 Número ganador: {ultimoGanador.numero}
            </p>
            <p className="fecha">
              {ultimoGanador.creadoEn?.toDate().toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* ===== LISTADO DE RIFAS ===== */}
      <div className="rifas-grid">
        {rifas.map(r => (
          <div key={r.id} className="rifa-card-home">
            <h3>{r.titulo}</h3>

            <p><b>Precio:</b> ${r.precioNumero}</p>
            <p><b>Lotería:</b> {r.loteria}</p>
            <p className="fecha-sorteo">
              <b>Sorteo:</b>{' '}
              {r.fechaSorteo?.toDate().toLocaleString()}
            </p>

            <Link to={`/rifa/${r.id}`}>
              <button className="btn-participar">
                Participar
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
