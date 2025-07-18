import { useAuth } from '../lib/auth'
import { useSchema, Form, Input } from './components/form'

export default function Page() {
  const { login, logout, logged } = useAuth()

  console.log(logged)
  return (
    <>hello world</>
  )
}