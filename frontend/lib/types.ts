import { useNavigate, useParams, useLocation, } from 'react-router'

export interface Route {
	navigate: ReturnType<typeof useNavigate>
	params: any
	location: ReturnType<typeof useLocation>
}