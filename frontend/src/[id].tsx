import { Route } from '../lib/route'

export default function User(route: Route) {
  const { id } = route.params

  return (
    <div className="flex flex-col">
      <p className="">{id}</p>
      <p className="">{id}</p>
    </div>
  )
}