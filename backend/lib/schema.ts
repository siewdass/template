import { z, ZodString, ZodNumber, ZodBoolean } from "zod";

type FieldConfig = {
  type:
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | ArrayConstructor
    | ObjectConstructor;
  min?: number;
  max?: number;
  email?: boolean;
  regex?: RegExp;
  uuid?: boolean;
  optional?: boolean;
  nullable?: boolean;
  default?: any;
  value?: any; // literal
  values?: readonly [string, ...string[]]; // enum values
  items?: FieldConfig; // array items
  shape?: SchemaConfig; // object shape
  refine?: (val: any) => boolean;
  messages?: Partial<Record<"min" | "max" | "email" | "regex" | "uuid" | "refine", string>>;
};

type SchemaConfig = Record<string, FieldConfig>;

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
          let s: ZodString = z.string();
          if (f.min !== undefined) s = s.min(f.min, { message: f.messages?.min });
          if (f.max !== undefined) s = s.max(f.max, { message: f.messages?.max });
          if (f.email) s = s.email({ message: f.messages?.email });
          if (f.regex) s = s.regex(f.regex, { message: f.messages?.regex });
          if (f.uuid) s = s.uuid({ message: f.messages?.uuid });
          t = s;
        }
        break;

      case Number:
        if (f.value !== undefined) {
          t = z.literal(f.value);
        } else {
          let n: ZodNumber = z.number();
          if (f.min !== undefined) n = n.min(f.min, { message: f.messages?.min });
          if (f.max !== undefined) n = n.max(f.max, { message: f.messages?.max });
          t = n;
        }
        break;

      case Boolean:
        if (f.value !== undefined) {
          t = z.literal(f.value);
        } else {
          let b: ZodBoolean = z.boolean();
					b = t;
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
      t = t?.refine(f.refine, { message: f.messages?.refine });
    }

    if (f.optional) t = t?.optional();
    if (f.nullable) t = t?.nullable();
    if (f.default !== undefined && "default" in t) {
      t = (t as any).default(f.default);
    }

    shape[key] = t;
  }

  return z.object(shape);
}
