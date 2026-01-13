import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Estadisticas() {
  const [stats, setStats] = useState({ rifas: 0, compras: 0 })

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'rifas')),
      getDocs(collection(db, 'compras'))
    ]).then(([r, c]) => {
      setStats({ rifas: r.size, compras: c.size })
    })
  }, [])

  return (
    <div>
      <h2>Estadísticas</h2>
      <p>Total rifas: {stats.rifas}</p>
      <p>Total compras: {stats.compras}</p>
    </div>
  )
}
