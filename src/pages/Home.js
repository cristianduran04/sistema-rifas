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

    // Buscar datos de la rifa ganadora
    const rifasSnap = await getDocs(collection(db, 'rifas'))
    const rifa = rifasSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .find(r => r.id === ganador.rifaId)

    setRifaGanadora(rifa)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🎟 Rifas disponibles</h1>

      {/* 🔔 ANUNCIO / PUBLICIDAD */}
      {ultimoGanador && rifaGanadora && (
        <div
          style={{
            background: '#111',
            color: '#fff',
            padding: 20,
            borderRadius: 10,
            marginBottom: 30
          }}
        >
          <h2>🎉 Último ganador</h2>
          <p><b>Rifa:</b> {rifaGanadora.titulo}</p>
          <p><b>Lotería:</b> {rifaGanadora.loteria}</p>
          <p><b>Número ganador:</b> {ultimoGanador.numero}</p>
          <p>
            <b>Fecha:</b>{' '}
            {ultimoGanador.creadoEn?.toDate().toLocaleString()}
          </p>
        </div>
      )}

      {/* 🧾 TARJETAS DE RIFAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 20
        }}
      >
        {rifas.map(r => (
          <div
            key={r.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 12,
              padding: 15,
              background: '#fff',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            <h3>{r.titulo}</h3>

            <p><b>Precio:</b> ${r.precioNumero}</p>
            <p><b>Lotería:</b> {r.loteria}</p>

            <p>
              <b>Sorteo:</b>{' '}
              {r.fechaSorteo?.toDate().toLocaleString()}
            </p>

            <Link to={`/rifa/${r.id}`}>
              <button
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: 'none',
                  background: '#000',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Participar
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
