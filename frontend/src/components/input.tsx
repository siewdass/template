import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { createContext, useContext, ReactNode } from 'react';
import { useForm, RegisterOptions, UseFormReturn, FieldValues } from 'react-hook-form';

type FieldConfig = RegisterOptions & { default?: any };
type ExtendedForm<T extends Record<string, FieldConfig>> = UseFormReturn<FieldValues> & {
  validations: { [K in keyof T]: RegisterOptions };
};

interface FormProps {
  form: ExtendedForm<any>;
  children: ReactNode;
  onSubmit: (data: any) => void;
}

interface InputProps {
	id: string
	label: string
}

const FormContext = createContext<ExtendedForm<any> | null>(null);

export const useCurrentForm = () => {
  const form = useContext(FormContext);
  if (!form) throw new Error('Input must be used inside a Form');
  return form;
}

export const useCustomForm = <T extends Record<string, FieldConfig>>(fields: T): ExtendedForm<T> => {
  const defaultValues = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.default ?? '']));
  const validations = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, { ...v, default: undefined }])) as any;
  const form = useForm({ defaultValues });
  return { ...form, validations };
}

export const Form = ({ form, children, onSubmit }: FormProps) => (
  <FormContext.Provider value={form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
  </FormContext.Provider>
)

export const Input = ({ id, label }: InputProps) => {
  const form = useCurrentForm();
  const error = form.formState.errors[id];
  return (
		<FloatLabel style={{margin: '10px 0px 10px 0px' }}>
			<InputText id={id} {...form.register(id, form.validations[id])}  />
			<label htmlFor={id}>{label}</label>
			{error && <p className="floating-error">{String(error.message)}</p>}
		</FloatLabel>
  )
}