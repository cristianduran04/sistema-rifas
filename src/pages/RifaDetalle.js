import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase/config'
import { doc, getDoc, addDoc, collection, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function RifaDetalle() {
  const { id } = useParams()
  const { user } = useAuth()
  const [rifa, setRifa] = useState(null)
  const [numero, setNumero] = useState('')
  const [vendidos, setVendidos] = useState([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    const r = await getDoc(doc(db, 'rifas', id))
    setRifa({ id: r.id, ...r.data() })

    const c = await getDocs(collection(db, 'compras'))
    setVendidos(
      c.docs
        .filter(d => d.data().rifaId === id && d.data().estado === 'aprobado')
        .map(d => d.data().numero)
    )
  }

  const comprar = async () => {
    if (!user) return alert('Inicia sesión')
    if (vendidos.includes(Number(numero))) return alert('Número vendido')

    await addDoc(collection(db, 'compras'), {
      rifaId: id,
      userId: user.uid,
      numero: Number(numero),
      estado: 'pendiente'
    })

    alert('Compra enviada')
  }

  if (!rifa) return null

  return (
    <div>
      <h2>{rifa.titulo}</h2>

      <p>Vendidos: {vendidos.join(', ') || 'Ninguno'}</p>

      <input type="number" onChange={e => setNumero(e.target.value)} />
      <button onClick={comprar}>Comprar</button>
    </div>
  )
}

