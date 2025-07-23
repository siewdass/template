import { createContext, useContext, useRef } from 'react'
import { Toast } from 'primereact/toast'

type ToastProps = {
  show: (options: any) => void;
};

let toast: any

export const ToastContext = createContext<any>(null)

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
	const ref = useRef<ToastProps>(null)
	toast = ref

	const show = ({ title, message, error }: any) => {
		if (ref.current) {
			ref.current.show({
				severity: error ? 'error' : 'info',
				summary: title,
				detail: message
			})
		}
	}

	return (
		<ToastContext.Provider value={{ show }}>
			{children}
			<Toast ref={ref as any} />
		</ToastContext.Provider>
	)
}

export const showToast = ({ title, message, error }: any) => {
	if (toast?.current) {
		toast.current.show({
			severity: error ? 'error' : 'info',
			summary: title,
			detail: message
		})
	}
}