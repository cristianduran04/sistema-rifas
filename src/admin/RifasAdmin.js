import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function RifasAdmin() {
  const [rifas, setRifas] = useState([])
  const [numeroGanador, setNumeroGanador] = useState('')

  useEffect(() => {
    getDocs(collection(db, 'rifas')).then(snap =>
      setRifas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  const finalizar = async (rifaId) => {
    const comprasSnap = await getDocs(collection(db, 'compras'))
    const ganador = comprasSnap.docs.find(c =>
      c.data().rifaId === rifaId &&
      c.data().numero === Number(numeroGanador) &&
      c.data().estado === 'aprobado'
    )

    if (!ganador) return alert('Número no vendido')

    await addDoc(collection(db, 'ganadores'), {
      rifaId,
      numero: numeroGanador,
      userId: ganador.data().userId
    })

    await updateDoc(doc(db, 'rifas', rifaId), { estado: 'finalizada' })
    alert('Rifa finalizada')
  }

  return (
    <div>
      <h2>Rifas</h2>
      <input placeholder="Número ganador" onChange={e => setNumeroGanador(e.target.value)} />
      {rifas.map(r => (
        <div key={r.id}>
          <h4>{r.titulo} ({r.estado})</h4>
          {r.estado === 'activa' && (
            <button onClick={() => finalizar(r.id)}>Finalizar</button>
          )}
        </div>
      ))}
    </div>
  )
}
