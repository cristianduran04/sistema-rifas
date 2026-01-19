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
  /* ======================= STATES ======================= */
  const [rifas, setRifas] = useState([])
  const [ventasPorRifa, setVentasPorRifa] = useState({})
  const [numerosGanadores, setNumerosGanadores] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [formEdit, setFormEdit] = useState({})

  /* ======================= EFFECT ======================= */
  useEffect(() => {
    cargarRifas()
  }, [])

  /* ======================= DATA ======================= */
  const cargarRifas = async () => {
    // Rifas
    const rifasSnap = await getDocs(collection(db, 'rifas'))
    const rifasData = rifasSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Compras aprobadas
    const comprasSnap = await getDocs(collection(db, 'compras'))
    const conteo = {}

    comprasSnap.docs.forEach(doc => {
      const compra = doc.data()
      if (compra.estado === 'aprobado') {
        conteo[compra.rifaId] = (conteo[compra.rifaId] || 0) + 1
      }
    })

    setVentasPorRifa(conteo)
    setRifas(rifasData)
  }

  /* ======================= FINALIZAR RIFA ======================= */
  const finalizarRifa = async (rifaId) => {
    const numeroGanador = Number(numerosGanadores[rifaId])

    if (!numeroGanador) {
      alert('Ingresa el número ganador')
      return
    }

    const comprasSnap = await getDocs(collection(db, 'compras'))
    const ganador = comprasSnap.docs.find(doc => {
      const compra = doc.data()
      return (
        compra.rifaId === rifaId &&
        compra.numero === numeroGanador &&
        compra.estado === 'aprobado'
      )
    })

    if (!ganador) {
      alert('Ese número no fue vendido o no está aprobado')
      return
    }

    await addDoc(collection(db, 'ganadores'), {
      rifaId,
      numero: numeroGanador,
      userId: ganador.data().userId || null,
      creadoEn: new Date()
    })

    await updateDoc(doc(db, 'rifas', rifaId), {
      estado: 'finalizada'
    })

    alert('Rifa finalizada correctamente')
    cargarRifas()
  }

  /* ======================= EDICIÓN ======================= */
  const iniciarEdicion = (rifa) => {
    setEditandoId(rifa.id)
    setFormEdit({
      titulo: rifa.titulo,
      precioNumero: rifa.precioNumero,
      totalNumeros: rifa.totalNumeros,
      loteria: rifa.loteria
    })
  }

  const guardarEdicion = async (rifaId) => {
    await updateDoc(doc(db, 'rifas', rifaId), {
      titulo: formEdit.titulo,
      precioNumero: Number(formEdit.precioNumero),
      totalNumeros: Number(formEdit.totalNumeros),
      loteria: formEdit.loteria
    })

    alert('Rifa actualizada')
    setEditandoId(null)
    cargarRifas()
  }

  /* ======================= UI ======================= */
  return (
    <div className="rifas-admin-page">
      <h2>🎛 Gestión de Rifas</h2>

      {/* ================= RIFAS ACTIVAS ================= */}
      <h3 className="section-title">🟢 Rifas Activas</h3>

      <div className="rifas-grid">
        {rifas
          .filter(r => r.estado === 'activa')
          .map(r => {
            const vendidos = ventasPorRifa[r.id] || 0

            return (
              <div key={r.id} className="rifa-card activa">
                {editandoId === r.id ? (
                  <>
                    <input
                      value={formEdit.titulo}
                      onChange={e =>
                        setFormEdit({ ...formEdit, titulo: e.target.value })
                      }
                    />

                    <input
                      type="number"
                      value={formEdit.precioNumero}
                      onChange={e =>
                        setFormEdit({
                          ...formEdit,
                          precioNumero: e.target.value
                        })
                      }
                    />

                    <input
                      type="number"
                      value={formEdit.totalNumeros}
                      onChange={e =>
                        setFormEdit({
                          ...formEdit,
                          totalNumeros: e.target.value
                        })
                      }
                    />

                    <select
                      value={formEdit.loteria}
                      onChange={e =>
                        setFormEdit({ ...formEdit, loteria: e.target.value })
                      }
                    >
                      <option value="Boyacá">Boyacá</option>
                      <option value="Medellín">Medellín</option>
                      <option value="Cruz Roja">Cruz Roja</option>
                      <option value="Santander">Santander</option>
                    </select>

                    <button
                      className="btn-guardar"
                      onClick={() => guardarEdicion(r.id)}
                    >
                      Guardar
                    </button>

                    <button
                      className="btn-cancelar"
                      onClick={() => setEditandoId(null)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <h3>{r.titulo}</h3>
                    <p><b>Precio:</b> ${r.precioNumero}</p>
                    <p><b>Vendidos:</b> {vendidos}</p>
                    <p><b>Lotería:</b> {r.loteria}</p>

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
                      className="btn-editar"
                      onClick={() => iniciarEdicion(r)}
                    >
                      Editar
                    </button>
                  </>
                )}
              </div>
            )
          })}
      </div>

      {/* ================= RIFAS FINALIZADAS ================= */}
      <h3 className="section-title">⚫ Rifas Finalizadas</h3>

      <div className="rifas-grid">
        {rifas
          .filter(r => r.estado === 'finalizada')
          .map(r => {
            const vendidos = ventasPorRifa[r.id] || 0
            const totalRecaudado = vendidos * r.precioNumero

            return (
              <div key={r.id} className="rifa-card finalizada">
                <h3>{r.titulo}</h3>
                <p><b>Precio:</b> ${r.precioNumero}</p>
                <p><b>Vendidos:</b> {vendidos}</p>
                <p><b>Lotería:</b> {r.loteria}</p>
                <p>
                  <b>Sorteo:</b>{' '}
                  {r.fechaSorteo?.toDate().toLocaleString()}
                </p>

                <p className="dinero-final">
                  <b>Total recaudado:</b> ${totalRecaudado.toLocaleString()}
                </p>
              </div>
            )
          })}
      </div>
    </div>
  )
}
