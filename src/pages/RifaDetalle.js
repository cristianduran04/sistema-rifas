import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase/config'
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import '../styles/rifaDetalle.css'

const WHATSAPP_ADMIN = '573001234567' // 🔥 CAMBIA ESTE NÚMERO

export default function RifaDetalle() {
  const { id } = useParams()
  const { user } = useAuth()

  const [rifa, setRifa] = useState(null)
  const [ocupados, setOcupados] = useState([]) // aprobados + pendientes
  const [seleccionados, setSeleccionados] = useState([])
  const [cargando, setCargando] = useState(false)

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [metodoPago, setMetodoPago] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    const rifaSnap = await getDoc(doc(db, 'rifas', id))
    if (!rifaSnap.exists()) return

    const rifaData = { id: rifaSnap.id, ...rifaSnap.data() }
    setRifa(rifaData)

    // 🔒 BLOQUEAR aprobados + pendientes
    const comprasQ = query(
      collection(db, 'compras'),
      where('rifaId', '==', id),
      where('estado', 'in', ['pendiente', 'aprobado'])
    )

    const comprasSnap = await getDocs(comprasQ)
    setOcupados(comprasSnap.docs.map(d => d.data().numero))
  }

  // 🔢 Generar números según tipo
  const generarNumeros = () => {
    if (!rifa) return []

    let total = rifa.totalNumeros || 0
    let inicio = rifa.tipoNumero === 'ultimo' ? 0 : 1

    return Array.from({ length: total }, (_, i) => inicio + i)
  }

  const toggleNumero = (n) => {
    if (ocupados.includes(n)) return

    setSeleccionados(prev =>
      prev.includes(n)
        ? prev.filter(x => x !== n)
        : [...prev, n]
    )
  }

  const finalizarCompra = async () => {
    if (!nombre || !telefono || !metodoPago) {
      alert('Completa tus datos')
      return
    }

    if (seleccionados.length === 0) {
      alert('Selecciona números')
      return
    }

    // 🔥 Seguridad extra
    if (ocupados.some(n => seleccionados.includes(n))) {
      alert('Uno de los números ya fue tomado')
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
          comprador: { nombre, telefono, metodoPago },
          creadoEn: serverTimestamp()
        })
      }

      // 📲 WHATSAPP AL ADMIN
      const mensaje = `
🎟 NUEVA COMPRA DE RIFA
Rifa: ${rifa.titulo}
Comprador: ${nombre}
Teléfono: ${telefono}
Pago: ${metodoPago}
Números: ${seleccionados.join(', ')}
`

      const url = `https://wa.me/${573151577499}?text=${encodeURIComponent(
        mensaje
      )}`

      window.open(url, '_blank')

      alert('Compra registrada. Espera aprobación.')

      setSeleccionados([])
      setNombre('')
      setTelefono('')
      setMetodoPago('')
      cargar()
    } catch (e) {
      console.error(e)
      alert('Error al registrar compra')
    }

    setCargando(false)
  }

  if (!rifa) return <p>Cargando...</p>

  const disponibles = rifa.totalNumeros - ocupados.length

  return (
    <div className="rifa-container">
      <div className="rifa-card">
        <h2>{rifa.titulo}</h2>

        <p><b>Lotería:</b> {rifa.loteria}</p>
        <p><b>Sorteo:</b> {rifa.fechaSorteo?.toDate().toLocaleString()}</p>

        <div className="rifa-info">
          <span>Total: {rifa.totalNumeros}</span>
          <span>Ocupados: {ocupados.length}</span>
          <span>Disponibles: {disponibles}</span>
        </div>

        <h3>Selecciona tus números</h3>

        <div className="numeros-grid">
          {generarNumeros()
            .filter(n => !ocupados.includes(n)) // 🔥 SOLO DISPONIBLES
            .map(n => {
              const activo = seleccionados.includes(n)

              const texto =
                rifa.tipoNumero === 'dos'
                  ? String(n).padStart(2, '0')
                  : rifa.tipoNumero === 'cuatro'
                  ? String(n).padStart(4, '0')
                  : n

              return (
                <button
                  key={n}
                  className={`numero ${activo ? 'activo' : ''}`}
                  onClick={() => toggleNumero(n)}
                >
                  {texto}
                </button>
              )
            })}
        </div>

        {/* DATOS COMPRADOR */}
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
