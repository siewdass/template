import { Input, Form } from './components/formnew';
import { Schema } from '../lib/schema'

const mySchema = Schema({
  email: { type: String, email: true },
  password: { type: String, min: 3 },
  city: { type: String },
  age: { type: Number, min: 2 },
  phone: { type: String, phone: true },
  date: { type: Date },
  required: { type: Boolean }
})

export default () => {

  const cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ]

  const onSubmit = (e: any) => console.log(e)
  
  return (
    <Form schema={mySchema} onSubmit={onSubmit}>
      <Input id="email" type="email" label="Correo" />
      <Input id="password" type="password" label="Contrasena" />
      <Input id="city" type="select" label="Ciudad" options={cities} />
      <Input id="age" type="number" label="Edad" />
      <Input id="phone" type="phone" label="Telefono" />
      <Input id="date" type="date" label="Fecha" />
      <Input id="required" type="boolean" label="Requerido" />
      <button type="submit">Submit</button>
    </Form>
  )
}