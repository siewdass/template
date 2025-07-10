import { Table } from './components/table'

export default function Page() {

  const headers = [
    { field: 'id', header: 'Id' },
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' }
  ]

  return (
    <Table
      headers={headers}
      endpoint={'/user/getusers'}
    />
  )
}