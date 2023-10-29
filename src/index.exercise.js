// 🐨 you'll need to import react and createRoot from react-dom up here
import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Logo} from './components/logo'
import {Dialog} from '@reach/dialog'
import '@reach/dialog/styles.css'
import {LoginForm} from './components/login-form'

function App() {
  const [openModal, setOpenModal] = useState('none')
  const handleLogin = formData => {
    console.log('login', formData)
  }
  const handleRegister = formData => {
    console.log('register', formData)
  }

  return (
    <section>
      <Logo width="80" height="80" />
      <header>
        <h1>Bookshelf</h1>
      </header>
      <div>
        <button onClick={() => setOpenModal('login')}>Login</button>
      </div>
      <div>
        <button onClick={() => setOpenModal('register')}>Register</button>
      </div>
      <Dialog aria-label="Login form" isOpen={openModal === 'login'}>
        <div>
          <button onClick={() => setOpenModal('none')}>Close</button>
        </div>
        <h2>Login</h2>
        <LoginForm buttonText="Login" onSubmit={handleLogin} />
      </Dialog>
      <Dialog aria-label="Register form" isOpen={openModal === 'register'}>
        <div>
          <button onClick={() => setOpenModal('none')}>Close</button>
        </div>
        <h2>Register</h2>
        <LoginForm buttonText="Register" onSubmit={handleRegister} />
      </Dialog>
    </section>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
export {root}
