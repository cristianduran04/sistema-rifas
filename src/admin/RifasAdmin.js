import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'

export default function RifasAdmin() {
  const [rifas, setRifas] = useState([])
  const [ventasPorRifa, setVentasPorRifa] = useState({})
  const [numerosGanadores, setNumerosGanadores] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [formEdit, setFormEdit] = useState({})

  useEffect(() => {
    cargarRifas()
  }, [])

  const cargarRifas = async () => {
    const rifasSnap = await getDocs(collection(db, 'rifas'))
    const rifasData = rifasSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))

    const comprasSnap = await getDocs(collection(db, 'compras'))
    const conteo = {}

    comprasSnap.docs.forEach(d => {
      const c = d.data()
      if (c.estado === 'aprobado') {
        conteo[c.rifaId] = (conteo[c.rifaId] || 0) + 1
      }
    })

    setVentasPorRifa(conteo)
    setRifas(rifasData)
  }

  const finalizarRifa = async (rifaId) => {
    const numeroGanador = Number(numerosGanadores[rifaId])
    if (!numeroGanador) {
      alert('Ingresa el número ganador')
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
      userId: ganador.data().userId,
      creadoEn: new Date()
    })

    await updateDoc(doc(db, 'rifas', rifaId), {
      estado: 'finalizada'
    })

    alert('Rifa finalizada correctamente')
    cargarRifas()
  }

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

  return (
    <div style={{ padding: 20 }}>
      <h2>🎛 Panel de Rifas</h2>

      {rifas.map(r => (
        <div
          key={r.id}
          style={{
            border: '1px solid #ccc',
            padding: 15,
            marginBottom: 15,
            borderRadius: 6
          }}
        >
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

              <button onClick={() => guardarEdicion(r.id)}>Guardar</button>
              <button onClick={() => setEditandoId(null)}>Cancelar</button>
            </>
          ) : (
            <>
              <h3>{r.titulo}</h3>
              <p><b>Estado:</b> {r.estado}</p>
              <p><b>Precio:</b> ${r.precioNumero}</p>
              <p><b>Total números:</b> {r.totalNumeros}</p>
              <p>
                <b>Números vendidos:</b>{' '}
                {ventasPorRifa[r.id] || 0}
              </p>
              <p><b>Lotería:</b> {r.loteria}</p>
              <p>
                <b>Sorteo:</b>{' '}
                {r.fechaSorteo?.toDate().toLocaleString()}
              </p>

              {r.estado === 'activa' && (
                <>
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

                  <button onClick={() => finalizarRifa(r.id)}>
                    Finalizar
                  </button>

                  <button onClick={() => iniciarEdicion(r)}>
                    Editar
                  </button>
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
