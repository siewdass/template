import { useAuth } from '../../lib/auth'
import { useCustomForm, Form, Input } from '../components/form'
import { Fetch } from '../../lib/api'

export default function Page() {
  const myform = useCustomForm({
    name: { label: 'Nombre', type: 'text', required: true },
    email: { label: 'Correo', type: 'email', required: true },
    password: { label: 'Contrasena', type: 'password', required: true },
  })

  const onSubmit = (params: any) => Fetch({method: 'POST', endpoint: '/user/signup', params})
  
  return (
    <Form form={myform} onSubmit={onSubmit}>
      <Input id="name" />
      <Input id="email" />
      <Input id="password" />
      <button type="submit">Log In</button>
    </Form>
  )
}