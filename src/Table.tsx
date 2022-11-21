import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'

//
import './index.css'

//
import {
    Column,
    Table,
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    RowData,
    getExpandedRowModel,
    getGroupedRowModel,
    GroupingState,
    createRow,
    ExpandedState,
    RowSelectionState,
    Row,
    Updater,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'
import { TableRow } from './Row'
import { useSkipper } from './hooks/useSkipper'
import { flattenGroupedRows } from './flattenGroupedRows'

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
    }
}

// Give our default column cell renderer editing superpowers!
const inputCell: Partial<ColumnDef<Person>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue()
        // We need to keep and update the state of the cell normally
        const [value, setValue] = React.useState(initialValue)

        // When the input is blurred, we'll call our table meta's updateData function
        const onBlur = () => {

            table.options.meta?.updateData(index, id, value)
        }

        // If the initialValue is changed external, sync it up with our state
        React.useEffect(() => {
            setValue(initialValue)
        }, [initialValue])

        useEffect(() => {
            if (initialValue !== value) {
                onBlur()
            }
        }, [value])

        return (
            <input
                value={value as string}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
            />
        )
    },
}

const serverData = makeData(5)
type OriginalData = Person

const mergeChangedData = (changed: Array<Partial<Person>>, old: Array<Person>) => {
    return old.map(o => {
        const newData = changed.find(c => c.id === o.id)
        if (!newData) return o
        return {
            ...o,
            ...newData
        }
    })
}

export function TableComponent() {

    const columns = React.useMemo<ColumnDef<Person>[]>(
        () => [
            {
                header: 'Name',
                footer: props => props.column.id,
                columns: [
                    {
                        accessorKey: 'firstName',
                        footer: props => props.column.id,
                    },
                    {
                        accessorFn: row => row.lastName,
                        id: 'lastName',
                        header: () => <span>Last Name</span>,
                        footer: props => props.column.id,
                    },
                ],
            },
            {
                header: 'Info',
                footer: props => props.column.id,
                columns: [
                    {
                        accessorKey: 'age',
                        header: () => 'Age',
                        footer: props => props.column.id,
                    },
                    {
                        header: 'More Info',
                        columns: [
                            {
                                accessorKey: 'visits',
                                header: () => <span>Visits</span>,
                                footer: props => props.column.id,
                                aggregationFn: "sum"
                            },
                            {
                                accessorKey: 'status',
                                header: 'Status',
                                footer: props => props.column.id,
                            },
                            {
                                accessorKey: 'progress',
                                header: 'Profile Progress',
                                footer: props => props.column.id,
                                id: "progress"
                            },
                            {
                                accessorKey: 'renders',
                                id: 'renders',
                                header: 'Renders',
                                footer: props => props.column.id,
                            },
                        ],
                    },
                ],
            },
        ],
        []
    )
    const [changedData, setChangedData] = useState<Array<Partial<Person>>>([])
    const data = useMemo(
        () =>
            changedData.length ? mergeChangedData(changedData, serverData)
                : serverData,
        [changedData])

    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
    const [grouping, setGrouping] = React.useState<GroupingState>(['age'])
    const [expanded, setExpanded] = React.useState<ExpandedState>()
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex,
        state: {
            grouping,
            expanded,
        },
        onExpandedChange: (v: Updater<ExpandedState>) => {
            console.log(v.valueOf())
            setExpanded(v)
        },
        debugTable: true,
        autoResetExpanded: false
    })
    console.log(changedData, data)

    const [rows, setRows] = useState<Array<Row<Person>>>(() => flattenGroupedRows(table.getRowModel().rows))

    const flattenedRows = useMemo(() =>
        flattenGroupedRows(table.getRowModel().rows)
        , [expanded, rows, changedData])

    const onCellChange = useCallback((rowIndex: number, columnId: string, value: any, rowId: number) => {
        setRows((prev: any) => {
            const existing = prev[rowIndex]

            setChangedData(old => {
                const existingChanged = old.findIndex(cd => cd.id === rowId)
                console.log(existingChanged)
                if (existingChanged === -1) return [
                    ...old,
                    { id: rowId, [columnId]: parseInt(value) }
                ]
                old.splice(existingChanged, 1, {
                    ...old[existingChanged],
                    [columnId]: parseInt(value)
                })
                return old.slice()
            })

            prev.splice(rowIndex, 1,
                createRow(table, existing.id, { ...existing.original, [columnId]: value }, rowIndex, existing.depth, existing.subRows)
            )
            return prev.slice()
        })
    }, [])
    useEffect(() => {
        setRows(flattenedRows)
    }, [expanded])

    return (
        <div className="p-2">
            <div className="h-2" />
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                return (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <div>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}

                                            </div>
                                        )}
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {flattenedRows.map((row, i) =>
                        <TableRow
                            row={row}
                            memoRow={rows[i]}
                            key={i}
                            onCellChange={onCellChange}
                            index={i}
                        />)}
                </tbody>
            </table>

        </div>
    )
}
