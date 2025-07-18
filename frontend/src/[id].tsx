import { Input, useSchema, Form } from './components/form';

export default () => {
  const cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ]

  const myform = useSchema({
    email: { label: 'Correo', type: 'email', required: true },
    username: { label: 'Usuario', type: 'text', required: true },
    phone: { label: 'Telefono', type: 'phone', required: true },
    cities: { label: 'Ciudades', type: 'select', options: cities },
    age: { label: 'Edad', default: '123', type: 'number' },
    password: { label: 'Contrasena', type: 'password', required: true },
    date: { label: 'Fecha', type: 'date', required: true },
  })

  const onSubmit = (e: any) => console.log(e)
  
  return (
    <Form form={myform} onSubmit={onSubmit}>
      <Input id="email" />
      <Input id="username" />
      <Input id="cities" />
      <Input id="age" />
      <Input id="phone" />
      <Input id="password" />
      <Input id="date" />
      <button type="submit">Submit</button>
    </Form>
  )
}