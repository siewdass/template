import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { InputMask } from 'primereact/inputmask';
import { Calendar } from 'primereact/calendar';

import { createContext, useContext, ReactNode } from 'react';
import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';

interface Config {
  type: 'text' | 'email' | 'select' | 'number' | 'password' | 'phone' | 'date'
  default?: any;
  options?: { name: string; code: string }[];
  required?: boolean | string
  pattern?: { value: RegExp; message: string }
  label: string
}

interface FormContextValue {
  form: UseFormReturn<FieldValues>;
  validations: Record<string, Config>;
}

interface FormProps {
  form: FormContextValue;
  children: ReactNode;
  onSubmit: (data: any) => void;
}

interface InputProps {
  id: string;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useCurrentForm = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('Input must be used inside a Form');
  return context;
}

export const useCustomForm = <T extends Record<string, Config>>(fields: T): FormContextValue => {
  const defaultValues = Object.fromEntries(
    Object.entries(fields).map(([key, config]) => [key, config.default ?? ''])
  );

  const validations = Object.fromEntries(
    Object.entries(fields).map(([key, config]) => {
      const { default: _, ...validation } = config;
      return [key, validation];
    })
  );

  const form = useForm({ defaultValues });
  return { form, validations };
};

export const Form = ({ form, children, onSubmit }: FormProps) => (
  <FormContext.Provider value={form}>
    <form onSubmit={form.form.handleSubmit(onSubmit)}>{children}</form>
  </FormContext.Provider>
);

export const Input = ({ id }: InputProps) => {
  const { form, validations } = useCurrentForm();
  const error = form.formState.errors[id];
  const config = validations[id] || {};

  if (config.required === true)
    config.required = `${config.label} is required`;
  if (config.type === 'email')
    config.pattern = { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
  
  return (
    <FloatLabel style={{ margin: '10px 0px 10px 0px' }}>
      { config.type === 'select' ?
        <Dropdown id={id}
          value={form.watch(id)}
          options={config.options || []}
          optionLabel="name"
          onChange={(e) => form.setValue(id, e.value)}
          onBlur={form.register(id, config).onBlur}
          style={{ width: '100%' }}
        /> :
      config.type === 'number' ?
        <InputNumber id={id}
          value={form.watch(id)}
          onValueChange={(e) => form.setValue(id, e.value)}
          onBlur={form.register(id, config).onBlur}
        /> :
      config.type === 'password' ?
        <Password id={id}
          value={form.watch(id)}
          onChange={(e) => form.setValue(id, e.target.value)}
          onBlur={form.register(id, config).onBlur}
          feedback={false}
        /> :
      config.type === 'phone' ?
        <InputMask id={id} mask="999 999-9999" {...form.register(id, config)} /> :
      config.type === 'date' ?
        <Calendar id={id}
          value={form.watch(id)}
          onChange={(e) => form.setValue(id, e.value)}
          onBlur={form.register(id, config).onBlur}
        /> :
        <InputText id={id} {...form.register(id, config)} />
      }
      <label htmlFor={id}>{config.label}</label>
      {error && <p className="floating-error">{String(error.message)}</p>}
    </FloatLabel>
  );
};