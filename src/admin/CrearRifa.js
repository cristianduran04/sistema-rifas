import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function CrearRifa() {
  const [titulo, setTitulo] = useState('')
  const [precio, setPrecio] = useState('')
  const [total, setTotal] = useState('')
  const [fechaHoraFin, setFechaHoraFin] = useState('')
  const [loteria, setLoteria] = useState('')

  const guardar = async () => {
    if (!titulo || !precio || !total || !fechaHoraFin || !loteria) {
      alert('Completa todos los campos')
      return
    }

    await addDoc(collection(db, 'rifas'), {
      titulo,
      precioNumero: Number(precio),
      totalNumeros: Number(total),
      numerosVendidos: 0,
      estado: 'activa',

      // 🔥 fecha y hora exacta del sorteo
      fechaSorteo: Timestamp.fromDate(new Date(fechaHoraFin)),

      // 🔥 lotería colombiana
      loteria,

      creadoEn: Timestamp.now()
    })

    alert('Rifa creada correctamente')

    setTitulo('')
    setPrecio('')
    setTotal('')
    setFechaHoraFin('')
    setLoteria('')
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🎟 Crear Rifa</h2>

      <input
        placeholder="Título de la rifa"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
      />

      <input
        type="number"
        placeholder="Precio por número"
        value={precio}
        onChange={e => setPrecio(e.target.value)}
      />

      <input
        type="number"
        placeholder="Cantidad total de números"
        value={total}
        onChange={e => setTotal(e.target.value)}
      />

      {/* 🔥 FECHA + HORA */}
      <input
        type="datetime-local"
        value={fechaHoraFin}
        onChange={e => setFechaHoraFin(e.target.value)}
      />

      <select
        value={loteria}
        onChange={e => setLoteria(e.target.value)}
      >
        <option value="">Selecciona la lotería</option>
        <option value="Boyacá">Lotería de Boyacá</option>
        <option value="Medellín">Lotería de Medellín</option>
        <option value="Cruz Roja">Cruz Roja</option>
        <option value="Santander">Lotería de Santander</option>
        <option value="Bogotá">Bogotá</option>
      </select>

      <button onClick={guardar}>Guardar Rifa</button>
    </div>
  )
}

