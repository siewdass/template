import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Password } from "primereact/password";
import { InputMask } from "primereact/inputmask";
import { Calendar } from "primereact/calendar";

import { memo, createContext, useContext, ReactNode } from "react";
import { useForm, Controller, UseFormReturn, FieldValues, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface FormContextValue {
  form: UseFormReturn<FieldValues>;
}

interface FormProps {
  schema: any;
  children: ReactNode;
  onSubmit: (data: any) => void;
}

interface InputProps {
  id: string;
  label: string
  type: string
  options?: any
  //format: string phone
}

const FormContext = createContext<FormContextValue | null>(null);

export const useCurrentForm = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error("Input must be used inside a Form");
  return context;
};

export const Form = ({ schema, children, onSubmit }: FormProps) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(Object.keys(schema.shape).map((key) => [key, undefined])),
  });

  return (
    <FormContext.Provider value={{ form }}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </FormContext.Provider>
  );
};

export const Input = memo(({ id, label, type, options }: InputProps) => {
  const { form } = useCurrentForm();
  const { errors } = useFormState({ control: form.control, name: id });
  const error = errors[id];

  return (
    <FloatLabel style={{ margin: "10px 0", width: '100%' }}>
      <Controller
        name={id}
        control={form.control}
        render={({ field }) => {
          const { value, onChange, onBlur } = field;

          switch (type) {
            case "select":
              return (
                <Dropdown
                  id={id}
                  value={value}
                  options={options || []}
                  optionLabel="name"
                  optionValue="code" 
                  onChange={(e) => onChange(e.value)}
                  onBlur={onBlur}
                  style={{ width: "100%" }}
                />
              );

            case "number":
              return (
                <InputNumber
                  id={id}
                  value={value}
                  onChange={(e)=>onChange(e.value)}
                  onBlur={onBlur}
                  style={{ width: "100%" }}
                />
              );

            case "password":
              return (
                <Password
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  feedback={false}
                  toggleMask
                  style={{ width: "100%" }}
                />
              );

            case "phone":
              return (
                <InputMask
                  id={id}
                  mask="999 999-9999"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  style={{ width: "100%" }}
                  // format
                />
              );

            case "date":
              return (
                <Calendar
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.value)}
                  /*onInput={(e: any)=>{
                    onChange(e.target.value)
                  }}*/
                  onBlur={onBlur}
                  keepInvalid
                  style={{ width: "100%" }}
                  // min max format
                />
              );

            case "boolean":
              return (
                  <input
                    id={id}
                    readOnly
                    className={`p-inputtext p-component ${value !== undefined && 'p-filled'}`}
                    value={
                      value === true ? 'Si' : value === false ? 'No' : ''
                    }
                    onClick={() => {
                      onChange(
                        value === undefined ? true : value === true ? false : undefined
                      )
                    }}
                    onBlur={onBlur}
                    style={{ width: "100%", cursor: "pointer" }}
                  />
              );

            default:
              return (
                <InputText
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  style={{ width: "100%" }}
                />
              );
          }
        }}
      />
      <label htmlFor={id}>{label}</label>
      {error && <p className="floating-error">{String(error.message)}</p>}
    </FloatLabel>
  )
})