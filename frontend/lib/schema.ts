import { z } from "zod";

type FieldConfig = {
  type:
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | ArrayConstructor
    | ObjectConstructor
    | DateConstructor;
  min?: number;
  max?: number;
  email?: boolean;
  regex?: RegExp;
  uuid?: boolean;
  phone?: boolean;
  optional?: boolean;
  nullable?: boolean;
  default?: any;
  value?: any;
  values?: readonly [string, ...string[]];
  items?: FieldConfig;
  shape?: SchemaConfig;
  refine?: (val: any) => boolean;
  messages?: Partial<
    Record<
      "required" | "min" | "max" | "email" | 'phone' | "regex" | "uuid" | "refine" | "date",
      string
    >
  >;
};

type SchemaConfig = Record<string, FieldConfig>;

const defaultMessages = {
  required: "Este campo es obligatorio",
  min: "El valor es demasiado corto",
  max: "El valor es demasiado largo",
  email: "Formato de correo inválido",
  phone: "Formato de teléfono inválido", 
  regex: "Formato inválido",
  uuid: "UUID inválido",
  refine: "Valor inválido",
  date: "Fecha inválida",
};

export function Schema(config: SchemaConfig) {
  const shape: Record<string, any> = {};

  for (const key in config) {
    const f = config[key];
    let t;

    switch (f.type) {
      case String:
        if (f.value !== undefined) {
          t = z.literal(f.value);
        } else if (f.values) {
          t = z.enum(f.values as any);
        } else {
          let s = z.string();

          // Si no es opcional Y no tiene min definido, automáticamente min = 1
          if (!f.optional && f.min === undefined) {
            s = s.min(1, { message: f.messages?.required || defaultMessages.required });
          }

          if (f.min !== undefined) s = s.min(f.min, { message: f.messages?.min || defaultMessages.min });
          if (f.max !== undefined) s = s.max(f.max, { message: f.messages?.max || defaultMessages.max });
          if (f.email) s = s.email({ message: f.messages?.email || defaultMessages.email });
          if (f.phone) s = s.regex(/^\d{3}\s\d{3}-\d{4}$/, { message: f.messages?.phone || defaultMessages.phone });
          if (f.regex) s = s.regex(f.regex, { message: f.messages?.regex || defaultMessages.regex });
          if (f.uuid) s = s.uuid({ message: f.messages?.uuid || defaultMessages.uuid });

          t = z.preprocess((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return val;
          }, s.optional());

          if (!f.optional) {
            t = t.refine((val) => val !== undefined, {
              message: f.messages?.required || defaultMessages.required,
            });
          }
        }
        break;

      case Number:
        if (f.value !== undefined) {
          t = z.literal(f.value);
        } else {
          let n = z.number();

          if (f.min !== undefined) {
            n = n.min(f.min, { message: f.messages?.min || defaultMessages.min });
          }
          if (f.max !== undefined) {
            n = n.max(f.max, { message: f.messages?.max || defaultMessages.max });
          }

          t = z.preprocess((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return Number(val);
          }, n.optional());

          if (!f.optional) {
            t = t.refine((val) => val !== undefined, {
              message: f.messages?.required || defaultMessages.required,
            });
          }
        }
        break;

      case Boolean:
        if (f.value !== undefined) {
          t = z.literal(f.value);
        } else {
          let b = z.boolean();
          t = z.preprocess((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return val;
          }, b.optional());

          if (!f.optional) {
            t = t.refine((val) => val !== undefined, {
              message: f.messages?.required || defaultMessages.required,
            });
          }
        }
        break;

      case Date:
        // Schema base que maneja todos los casos
        t = z.union([z.date(), z.string(), z.undefined(), z.null()])
          .refine(val => {
            // PRIMERA validación: campo requerido
            if (!f.optional && (val === undefined || val === null || val === "")) {
              return false;
            }
            return true;
          }, {
            message: f.messages?.required || defaultMessages.required,
          })
          .refine(val => {
            // SEGUNDA validación: formato de fecha (solo si no está vacío)
            if (val === undefined || val === null || val === "") {
              return true; // Permitir valores vacíos si llegaron hasta aquí
            }
            
            if (typeof val === 'string') {
              const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
              if (!dateRegex.test(val)) {
                return false;
              }
              
              const date = new Date(val);
              return !isNaN(date.getTime());
            }
            
            if (val instanceof Date) {
              return !isNaN(val.getTime());
            }
            
            return false;
          }, {
            message: f.messages?.date || defaultMessages.date
          })
          .transform(val => {
            if (val === "" || val === null || val === undefined) return undefined;
            if (typeof val === 'string') return new Date(val);
            return val;
          });
        
        if (f.optional) {
          t = t.optional();
        }
        break;

      case Array:
        if (!f.items) throw new Error(`Array type must have 'items' config`);
        t = z.array(Schema({ item: f.items }).shape.item);
        break;

      case Object:
        if (!f.shape) throw new Error(`Object type must have 'shape' config`);
        t = Schema(f.shape);
        break;

      default:
        throw new Error(`Unsupported type: ${f.type}`);
    }

    if (f.refine) {
      t = t.refine(f.refine, { message: f.messages?.refine || defaultMessages.refine });
    }

    if (f.optional) t = t.optional();
    if (f.nullable) t = t.nullable();

    if (f.default !== undefined && "default" in t) {
      t = (t as any).default(f.default);
    }

    shape[key] = t;
  }

  return z.object(shape);
}