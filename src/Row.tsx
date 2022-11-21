import {
    Row,
    flexRender,
} from '@tanstack/react-table'
import { memo, useMemo, useRef } from 'react';
import { DataRow } from './DataRow';

import { Person } from "./makeData";

export type TableRowProps = {
    row: Row<Person>
    memoRow: Row<Person>
    index: number
    onCellChange: (rowIndex: number, columnId: string, value: any, rowId: number) => void
}

export const TableRow: React.FC<TableRowProps> = ({ row,memoRow, index, onCellChange }) => {
    const renders = useRef(0)
    renders.current++
    return (
        <tr key={row.id}>
            {row.getIsGrouped() ?

                row.getVisibleCells().map((cell: any) => {
                    if (cell.column.id === "renders")
                        return <td>{renders.current}</td>
                    return (
                        <td
                            {...{
                                key: cell.id,
                                style: {
                                    background: cell.getIsGrouped()
                                        ? '#0aff0082'
                                        : cell.getIsAggregated()
                                            ? '#ffa50078'
                                            : cell.getIsPlaceholder()
                                                ? '#ff000042'
                                                : 'white',
                                },
                            }}
                        >
                            {cell.getIsGrouped() ? (
                                // If it's a grouped cell, add an expander and row count
                                <>
                                    <button
                                        {...{
                                            onClick: row.getToggleExpandedHandler(),
                                            style: {
                                                cursor: row.getCanExpand()
                                                    ? 'pointer'
                                                    : 'normal',
                                            },
                                        }}
                                    >
                                        {row.getIsExpanded() ? '👇' : '👉'}{' '}
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}{' '}
                                        ({row.subRows.length})
                                    </button>
                                </>
                            ) : cell.getIsAggregated() ? (
                                // If the cell is aggregated, use the Aggregated
                                // renderer for cell
                                flexRender(
                                    cell.column.columnDef.aggregatedCell ??
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )
                            ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                                // Otherwise, just render the regular cell
                                flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )

                            )}
                        </td>
                    )
                })
                : <DataRow row={memoRow} index={index} onCellChange={onCellChange} />


            }

        </tr>
    );
}