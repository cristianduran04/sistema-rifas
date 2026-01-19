import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import '../styles/rifasAdmin.css'

export default function RifasAdmin() {
  const [rifas, setRifas] = useState([])
  const [ventasPorRifa, setVentasPorRifa] = useState({})
  const [numerosGanadores, setNumerosGanadores] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const [comprasPorRifa, setComprasPorRifa] = useState({})
  const [rifaAbierta, setRifaAbierta] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  /* ================= CARGAR TODO ================= */
  const cargarDatos = async () => {
    const rifasSnap = await getDocs(collection(db, 'rifas'))
    const comprasSnap = await getDocs(collection(db, 'compras'))

    const rifasData = rifasSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))

    const conteo = {}
    const comprasMap = {}

    comprasSnap.docs.forEach(d => {
      const c = d.data()

      if (c.estado !== 'aprobado') return
      if (!c.rifaId) return

      // conteo
      conteo[c.rifaId] = (conteo[c.rifaId] || 0) + 1

      // compradores
      if (!comprasMap[c.rifaId]) comprasMap[c.rifaId] = []

      comprasMap[c.rifaId].push({
        nombre: c.comprador?.nombre || 'Sin nombre',
        telefono: c.comprador?.telefono || '',
        metodoPago: c.comprador?.metodoPago || 'No definido',
        numero: c.numero
      })
    })

    setVentasPorRifa(conteo)
    setComprasPorRifa(comprasMap)
    setRifas(rifasData)
  }

  /* ================= FINALIZAR RIFA ================= */
  const finalizarRifa = async (rifaId) => {
    const numeroGanador = Number(numerosGanadores[rifaId])
    if (isNaN(numeroGanador)) {
      alert('Ingresa un número ganador válido')
      return
    }

    const comprasSnap = await getDocs(collection(db, 'compras'))
    const ganador = comprasSnap.docs.find(c =>
      c.data().rifaId === rifaId &&
      c.data().numero === numeroGanador &&
      c.data().estado === 'aprobado'
    )

    if (!ganador) {
      alert('Ese número no fue vendido o no está aprobado')
      return
    }

    await addDoc(collection(db, 'ganadores'), {
      rifaId,
      numero: numeroGanador,
      nombre: ganador.data().comprador?.nombre || '',
      metodoPago: ganador.data().comprador?.metodoPago || '',
      creadoEn: new Date()
    })

    await updateDoc(doc(db, 'rifas', rifaId), {
      estado: 'finalizada'
    })

    alert('Rifa finalizada correctamente')
    cargarDatos()
  }

  /* ================= RENDER ================= */
  return (
    <div className="rifas-admin-page">
      <h2>🎛 Gestión de Rifas</h2>

      <h3 className="section-title">🟢 Rifas Activas</h3>

      <div className="rifas-grid">
        {rifas.filter(r => r.estado === 'activa').map(r => {
          const vendidos = ventasPorRifa[r.id] || 0
          const total = vendidos * r.precioNumero

          return (
            <div key={r.id} className="rifa-card activa">
              <h3>{r.titulo}</h3>

              <p><b>Precio:</b> ${r.precioNumero}</p>
              <p><b>Vendidos:</b> {vendidos}</p>
              <p><b>Lotería:</b> {r.loteria}</p>

              <div className="total-recaudado">
                Total recaudado: ${total}
              </div>

              <input
                type="number"
                placeholder="Número ganador"
                onChange={e =>
                  setNumerosGanadores({
                    ...numerosGanadores,
                    [r.id]: e.target.value
                  })
                }
              />

              <button
                className="btn-finalizar"
                onClick={() => finalizarRifa(r.id)}
              >
                Finalizar
              </button>

              <button
                className="btn-ver"
                onClick={() =>
                  setRifaAbierta(rifaAbierta === r.id ? null : r.id)
                }
              >
                {rifaAbierta === r.id
                  ? 'Ocultar compradores'
                  : 'Ver compradores'}
              </button>

              {/* ===== LISTA COMPRADORES ===== */}
              {rifaAbierta === r.id && (
                <div className="compradores-box">
                  <h4>🧾 Compradores</h4>

                  {comprasPorRifa[r.id]?.length ? (
                    <ul>
                      {comprasPorRifa[r.id].map((c, i) => (
                        <li key={i}>
                          <b>{c.nombre}</b> — Nº{' '}
                          {String(c.numero).padStart(
                            r.cifras || 2,
                            '0'
                          )}{' '}
                          — {c.metodoPago}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="sin-compras">Sin ventas aún</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
