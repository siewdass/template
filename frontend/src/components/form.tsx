import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { InputMask } from 'primereact/inputmask';
import { Calendar } from 'primereact/calendar';

import { memo } from 'react';
import { Controller, useFormState } from 'react-hook-form';

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

export const useSchema = <T extends Record<string, Config>>(fields: T): FormContextValue => {
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

export const Input = memo(({ id }: InputProps) => {
  const { form, validations } = useCurrentForm();
  const { errors } = useFormState({ control: form.control, name: id });
  const error = errors[id];
  const config = validations[id] || {};

  return (
    <FloatLabel style={{ margin: '10px 0' }}>
      <Controller
        name={id}
        control={form.control}
        rules={{
          pattern: config.pattern,
          required:
            config.required === true
              ? `${config.label} is required`
              : config.required || false,
        }}
        render={({ field }) => {
          const { value, onChange, onBlur } = field;

          switch (config.type) {
            case 'select':
              return (
                <Dropdown
                  id={id}
                  value={value}
                  options={config.options || []}
                  optionLabel="name"
                  onChange={(e) => onChange(e.value)}
                  onBlur={onBlur}
                  style={{ width: '100%' }}
                />
              );

            case 'number':
              return (
                <InputNumber
                  id={id}
                  value={value}
                  onValueChange={(e) => onChange(e.value)}
                  onBlur={onBlur}
                />
              );

            case 'password':
              return (
                <Password
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  feedback={false}
                  toggleMask
                />
              );

            case 'phone':
              return (
                <InputMask
                  id={id}
                  mask="999 999-9999"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                />
              );

            case 'date':
              return (
                <Calendar
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.value)}
                  onBlur={onBlur}
                />
              );

            default:
              return (
                <InputText
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                />
              );
          }
        }}
      />
      <label htmlFor={id}>{config.label}</label>
      {error && <p className="floating-error">{String(error.message)}</p>}
    </FloatLabel>
  );
});