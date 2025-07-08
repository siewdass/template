import { Params, NavigateFunction, Location } from 'react-router'

export interface Route {
  params: Readonly<Params<string>>
  navigate: NavigateFunction
  location?: Location
}
