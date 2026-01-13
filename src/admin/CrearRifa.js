import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function CrearRifa() {
  const [titulo, setTitulo] = useState('')
  const [precio, setPrecio] = useState('')
  const [total, setTotal] = useState('')

  const guardar = async () => {
    await addDoc(collection(db, 'rifas'), {
      titulo,
      precioNumero: Number(precio),
      totalNumeros: Number(total),
      numerosVendidos: 0,
      estado: 'activa'
    })
    alert('Rifa creada')
  }

  return (
    <div>
      <h2>Crear Rifa</h2>
      <input placeholder="Título" onChange={e => setTitulo(e.target.value)} />
      <input type="number" placeholder="Precio" onChange={e => setPrecio(e.target.value)} />
      <input type="number" placeholder="Total números" onChange={e => setTotal(e.target.value)} />
      <button onClick={guardar}>Guardar</button>
    </div>
  )
}
