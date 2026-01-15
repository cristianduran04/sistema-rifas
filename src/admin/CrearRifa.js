import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import '../styles/crearRifa.css'

export default function CrearRifa() {
  const [titulo, setTitulo] = useState('')
  const [precio, setPrecio] = useState('')
  const [fechaHoraFin, setFechaHoraFin] = useState('')
  const [loteria, setLoteria] = useState('')
  const [tipoNumero, setTipoNumero] = useState('')

  const calcularTotal = (tipo) => {
    if (tipo === 'ultimo') return 10
    if (tipo === 'dos') return 100
    if (tipo === 'cuatro') return 10000
    return 0
  }

  const guardar = async () => {
    if (!titulo || !precio || !fechaHoraFin || !loteria || !tipoNumero) {
      alert('Completa todos los campos')
      return
    }

    const totalNumeros = calcularTotal(tipoNumero)

    await addDoc(collection(db, 'rifas'), {
      titulo,
      precioNumero: Number(precio),
      totalNumeros, // 🔥 automático
      numerosVendidos: 0,
      estado: 'activa',
      fechaSorteo: Timestamp.fromDate(new Date(fechaHoraFin)),
      loteria,
      tipoNumero,
      creadoEn: Timestamp.now()
    })

    alert('Rifa creada correctamente')

    setTitulo('')
    setPrecio('')
    setFechaHoraFin('')
    setLoteria('')
    setTipoNumero('')
  }

  return (
    <div className="crear-rifa-page">
      <div className="crear-rifa-card">
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

        <select
          value={tipoNumero}
          onChange={e => setTipoNumero(e.target.value)}
        >
          <option value="">Tipo de número ganador</option>
          <option value="ultimo">Último número (0–9)</option>
          <option value="dos">Últimos 2 dígitos (00–99)</option>
          <option value="cuatro">Últimos 4 dígitos (0000–9999)</option>
        </select>

        {/* 🔍 INFORMACIÓN AUTOMÁTICA */}
        {tipoNumero && (
          <p className="info-total">
            Total de números: <b>{calcularTotal(tipoNumero)}</b>
          </p>
        )}

        <button onClick={guardar}>Guardar Rifa</button>
      </div>
    </div>
  )
}


