import { Flex } from './flex'
import { PanelMenu } from 'primereact/panelmenu'
import { useNavigate, useLocation } from 'react-router'
import { create } from 'zustand'

interface NavState {
  expandedKeys: Record<string, boolean>
  setExpandedKeys: (k: Record<string, boolean>) => void
}

const useNavigationStore = create<NavState>((set) => ({
  expandedKeys: (() => {
    try {
      const raw = localStorage.getItem('expandedKeys')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })(),
  setExpandedKeys: (k) => {
    localStorage.setItem('expandedKeys', JSON.stringify(k))
    set({ expandedKeys: k })
  },
}))

export function Navigation() {
  const navigate = useNavigate()
  const { pathname } = useLocation();

  const { expandedKeys, setExpandedKeys } = useNavigationStore();

  const template = (item: any, opts: any) => {
    const isParent = !!item.items;
    const isOpen = isParent && expandedKeys[item.key];

    return (
      <Flex
        onClick={opts.onClick}
        alignItems="center"
        gap={20}
        padding={isParent ? '20px 30px' : '15px 0 15px 30px'}
        cursor='pointer'
        userSelect='none'
        background={ item.path == pathname ? '#e8f2ff' : 'transparent'}
      >
        <span className={item.icon} style={{ fontWeight: isParent ? 'bold' : 'normal' }} />

        <span
            style={{ textTransform: isParent ? 'uppercase' : 'capitalize', fontWeight: isParent ? 'bold' : 'normal' }}
        >{item.label}</span>

        {isParent &&
          <span
            className="pi pi-chevron-right"
            style={{ marginLeft: 'auto', transition: 'transform 200ms', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        }
      </Flex>
    )
  }

  const paths = [{
    label: 'Cloud',
    icon: 'pi pi-cloud',
    items: [
      { label: 'Upload', icon: 'pi pi-cloud-upload', path: '/upload' },
      { label: 'Download', icon: 'pi pi-cloud-download', path: '/download' },
      { label: 'Sync', icon: 'pi pi-refresh', path: '/sync' },
    ],
  },
  {
    label: 'Devices',
    icon: 'pi pi-desktop',
    items: [
      { key: 'phone', label: 'Phone', icon: 'pi pi-mobile', path: '/phone' },
      { key: 'desktop', label: 'Desktop', icon: 'pi pi-desktop', path: '/desktop' },
      { key: 'tablet', label: 'Tablet', icon: 'pi pi-tablet', path: '/tablet' },
    ],
  }]

  const enrich = (items: any): any[] =>
    items.map((it: any) => {
      const key = it.label
      const base = { key, label: it.label, icon: it.icon, template };
      const children = it.items ? enrich(it.items) : undefined;
      const command = it.path ? () => navigate(it.path!) : undefined;
    return { ...base, ...(children ? { items: children } : { path: it.path, command }) };
  })

  const items = enrich(paths)

  return (
    <Flex width={300}>
      <PanelMenu
        model={items}
        multiple
        expandedKeys={expandedKeys}
        onExpandedKeysChange={setExpandedKeys}
      />
    </Flex>
  )
}
