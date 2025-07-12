import { useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import { useCustomForm, Form, Input } from '../components/form'

export default function Page() {
  const { login } = useAuth()

  const myform = useCustomForm({
    email: { label: 'Correo', type: 'email', required: true },
    password: { label: 'Contrasena', type: 'password', required: true },
  })

  const onSubmit = (e: any) => login(e)
  
  return (
    <Form form={myform} onSubmit={onSubmit}>
      <Input id="email" />
      <Input id="password" />
      <button type="submit">Log In</button>
    </Form>
  )
}