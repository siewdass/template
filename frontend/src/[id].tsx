import { useParams } from "react-router"

export default () => {
  const { id } = useParams()

  return (
    <>{id}</>
  )
}