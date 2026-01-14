import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function ComprasAdmin() {
  const [grupos, setGrupos] = useState([])
  const [rifasMap, setRifasMap] = useState({})

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    // 🔹 Cargar rifas
    const rifasSnap = await getDocs(collection(db, 'rifas'))
    const rifasObj = {}
    rifasSnap.docs.forEach(d => {
      rifasObj[d.id] = d.data()
    })
    setRifasMap(rifasObj)

    // 🔹 Cargar compras pendientes
    const comprasSnap = await getDocs(collection(db, 'compras'))

    const pendientes = comprasSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => c.estado === 'pendiente')

    const agrupadas = {}

    pendientes.forEach(c => {
      const key = `${c.rifaId}_${c.comprador?.telefono}`

      if (!agrupadas[key]) {
        agrupadas[key] = {
          rifaId: c.rifaId,
          comprador: c.comprador,
          compras: []
        }
      }

      agrupadas[key].compras.push({
        id: c.id,
        numero: c.numero
      })
    })

    setGrupos(Object.values(agrupadas))
  }

  const aprobarTodo = async (compras) => {
    if (!window.confirm('¿Aprobar toda esta compra?')) return

    for (const c of compras) {
      await updateDoc(doc(db, 'compras', c.id), {
        estado: 'aprobado'
      })
    }

    cargar()
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🧾 Compras pendientes</h2>

      {grupos.length === 0 && <p>No hay compras pendientes</p>}

      {grupos.map((g, i) => {
        const rifa = rifasMap[g.rifaId]
        const precio = rifa?.precioNumero || 0
        const total = precio * g.compras.length

        return (
          <div
            key={i}
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 15,
              marginBottom: 15
            }}
          >
            <h3>👤 {g.comprador?.nombre}</h3>
            <p>📞 {g.comprador?.telefono}</p>
            <p>💳 {g.comprador?.metodoPago}</p>

            <hr />

            <p><b>🎟️ Rifa:</b> {rifa?.titulo}</p>
            <p><b>🎰 Lotería:</b> {rifa?.loteria}</p>
            <p><b>🔢 Números:</b> {g.compras.map(c => c.numero).join(', ')}</p>
            <p><b>💰 Total:</b> ${total}</p>

            <button onClick={() => aprobarTodo(g.compras)}>
              Aprobar todo
            </button>
          </div>
        )
      })}
    </div>
  )
}

