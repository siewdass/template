import { ReactNode } from 'react'

interface Flex {
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number | string;
  children?: ReactNode;
  width?: number | string
  height?: number | string
  padding?: number | string
  margin?: number | string
  background?: string
  userSelect?: string
  cursor?: string
  onClick?: any
}

export const Flex = (props: Flex): ReactNode => {
  return <div onClick={props.onClick} style={{ display: 'flex', ...props as any }}>{props.children}</div>
}
