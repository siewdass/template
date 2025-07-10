import { useParams } from 'react-router';
import { Input, useCustomForm, Form } from './components/input';

export default function User() {
  const { id } = useParams();

  const myform = useCustomForm({
    email: {
      default: '',
      required: 'Email is required',
      pattern: {
        value: /^\S+@\S+$/i,
        message: 'Invalid email format'
      }
    },
    username: {
      default: '',
      required: 'Username is required'
    }
  })

  const onSubmit = (e: any) => {
    console.log(e)
  }

  return (
    <Form form={myform} onSubmit={onSubmit}>
      <Input id="email" label="Email" />
      <Input id="username" label="Username" />
      <button type="submit">Submit</button>
    </Form>
  )
}