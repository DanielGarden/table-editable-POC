import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { TableComponent } from './Table'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
     <TableComponent />
    </div>
  )
}

export default App
