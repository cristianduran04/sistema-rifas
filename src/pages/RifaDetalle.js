import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase/config'
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import '../styles/rifaDetalle.css'

export default function RifaDetalle() {
  const { id } = useParams()
  const { user } = useAuth()

  const [rifa, setRifa] = useState(null)
  const [vendidos, setVendidos] = useState([])
  const [seleccionados, setSeleccionados] = useState([])
  const [cargando, setCargando] = useState(false)

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [metodoPago, setMetodoPago] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    const r = await getDoc(doc(db, 'rifas', id))
    if (!r.exists()) return
    setRifa({ id: r.id, ...r.data() })

    const c = await getDocs(collection(db, 'compras'))
    setVendidos(
      c.docs
        .filter(
          d =>
            d.data().rifaId === id &&
            d.data().estado === 'aprobado'
        )
        .map(d => d.data().numero)
    )
  }

  const toggleNumero = (n) => {
    if (vendidos.includes(n)) return

    setSeleccionados(prev =>
      prev.includes(n)
        ? prev.filter(x => x !== n)
        : [...prev, n]
    )
  }

  const finalizarCompra = async () => {
    if (!nombre || !telefono || !metodoPago) {
      alert('Completa tus datos para continuar')
      return
    }

    if (seleccionados.length === 0) {
      alert('Selecciona al menos un número')
      return
    }

    setCargando(true)

    try {
      for (const n of seleccionados) {
        await addDoc(collection(db, 'compras'), {
          rifaId: id,
          userId: user ? user.uid : null,
          numero: n,
          estado: 'pendiente',
          comprador: {
            nombre,
            telefono,
            metodoPago
          },
          creadoEn: serverTimestamp()
        })
      }

      alert('Compra registrada correctamente')
      setSeleccionados([])
      setNombre('')
      setTelefono('')
      setMetodoPago('')
    } catch (error) {
      console.error(error)
      alert('Error al registrar la compra')
    }

    setCargando(false)
  }

  if (!rifa) return <p>Cargando...</p>

  const disponibles = rifa.totalNumeros - vendidos.length

  return (
    <div className="rifa-container">
      <div className="rifa-card">
        <h2>{rifa.titulo}</h2>

        <p><b>Lotería:</b> {rifa.loteria}</p>
        <p>
          <b>Sorteo:</b>{' '}
          {rifa.fechaSorteo?.toDate().toLocaleString()}
        </p>

        <div className="rifa-info">
          <span>Total: {rifa.totalNumeros}</span>
          <span>Vendidos: {vendidos.length}</span>
          <span>Disponibles: {disponibles}</span>
        </div>

        <h3>Selecciona tus números</h3>

        <div className="numeros-grid">
          {Array.from({ length: rifa.totalNumeros }, (_, i) => {
            const num = i + 1
            const vendido = vendidos.includes(num)
            const activo = seleccionados.includes(num)

            return (
              <button
                key={num}
                className={`numero ${
                  vendido ? 'vendido' : activo ? 'activo' : ''
                }`}
                onClick={() => toggleNumero(num)}
                disabled={vendido}
              >
                {num}
              </button>
            )
          })}
        </div>

        {/* DATOS DEL COMPRADOR */}
        <div className="datos-comprador">
          <input
            placeholder="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />

          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
          />

          <select
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value)}
          >
            <option value="">Método de pago</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
            <option value="Efectivo">Efectivo</option>
          </select>
        </div>

        <div className="acciones">
          <p>
            Seleccionados: {seleccionados.join(', ') || 'Ninguno'}
          </p>

          <button
            className="btn-comprar"
            onClick={finalizarCompra}
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : 'Finalizar compra'}
          </button>
        </div>
      </div>
    </div>
  )
}



