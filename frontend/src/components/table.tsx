import { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column';
import { Paginator, PaginatorCurrentPageReportOptions, PaginatorRowsPerPageDropdownOptions } from 'primereact/paginator'
import { Dropdown } from 'primereact/dropdown'
import { Flex } from './flex'
import { useQuery } from '../../lib/api';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

interface Table {
  endpoint: string
  headers: {
    field: string
    header: string
  }[]
  rowsPerPage?: number[]
}

interface User {
  id: number
  name: string
  email: string
}

export function Table({ rowsPerPage = [2,4,6], endpoint, headers }: Table) {
  const [selected, setSelected] = useState<any>({})

  const [ pagination, setPagination ] = useState({
    page: 1,
    limit: rowsPerPage[0]
  })

  const { data, isLoading } = useQuery({
    key: 'table',
    endpoint,
    params: pagination
  }, [ pagination ])

  const onPageChange = (event: any) => {
    setPagination(prev => ({
      ...prev,
      page: event.page + 1,
      limit: event.rows
    }))
  }

  return (
    <Flex flexDirection="column" width={'100%'}>
      <Toolbar
        style={{ border: 'none', padding: '0.50rem' }}
        start={(
          <Flex gap={10} alignItems="center">
            <span>Table Component</span>
            <InputText className="p-inputtext-sm" placeholder="Search" />
          </Flex>
        )}
        end={(
          <Flex gap={10}>
            <Button icon="pi pi-plus" size="small" outlined />
            <Button icon="pi pi-pencil" size="small" severity="success" outlined />
            <Button icon="pi pi-trash" size="small" severity="danger" outlined />
          </Flex>
        )}
      />
      <DataTable
        value={data?.items}
        selection={selected}
        onSelectionChange={(e) => setSelected(e.value)}
        dataKey="id"
        emptyMessage="Empty."
        loading={isLoading}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        { headers.map(({ field, header }: any, index: number) => <Column key={index} field={field} header={header}></Column>)}
      </DataTable>
      <Paginator
        template={{
          layout: 'RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink',
          RowsPerPageDropdown: ({value, onChange}: PaginatorRowsPerPageDropdownOptions) =>
            <Flex alignItems="center" gap={1}>
                <>Items per page:{' '}</>
                <Dropdown
                  value={value} 
                  options={rowsPerPage.map((r: number) => ({ label: r.toString(), value: r }))} 
                  onChange={onChange} 
                  className="p-dropdown-sm"
                />
            </Flex>,
          CurrentPageReport: ({first, last, totalRecords}: PaginatorCurrentPageReportOptions) =>
            <div style={{paddingLeft: 20, paddingRight: 5}}>{first} - {last} of {totalRecords}</div>
        }}
        first={(pagination.page - 1) * pagination.limit}
        rows={pagination.limit}
        totalRecords={data?.total || 0}
        onPageChange={onPageChange}
        style={{justifyContent: 'end'}}
      />
    </Flex>
  )
}
