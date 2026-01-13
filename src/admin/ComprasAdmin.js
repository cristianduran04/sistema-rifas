import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function ComprasAdmin() {
  const [compras, setCompras] = useState([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    const snap = await getDocs(collection(db, 'compras'))
    setCompras(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  const aprobar = async (id) => {
    await updateDoc(doc(db, 'compras', id), { estado: 'aprobado' })
    cargar()
  }

  return (
    <div>
      <h2>Compras pendientes</h2>

      {compras
        .filter(c => c.estado === 'pendiente')
        .map(c => (
          <div key={c.id}>
            <p>Rifa: {c.rifaId}</p>
            <p>Número: {c.numero}</p>
            <button onClick={() => aprobar(c.id)}>Aprobar</button>
          </div>
        ))}
    </div>
  )
}
