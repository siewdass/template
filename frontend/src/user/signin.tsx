import { useAuth } from '../../lib/auth'
import { Form, Input } from '../components/formnew'
import { Schema } from '../../lib/schema'

const mySchema = Schema({
  email: { type: String, email: true },
  password: { type: String, min: 3 }
})

export default function Page() {
  const { login } = useAuth()

  const onSubmit = (e: any) => login(e)
  
  return (
    <Form schema={mySchema} onSubmit={onSubmit}>
      <Input id="email" type="email" label="Correo" />
      <Input id="password" type="password" label="Contrasena" />
      <button type="submit">Log In</button>
    </Form>
  )
}