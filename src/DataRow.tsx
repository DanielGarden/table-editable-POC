import { Cell, flexRender, Row } from "@tanstack/react-table";
import { memo, useEffect, useRef } from "react";
import { Person } from "./makeData";

export type DataRowProps = {
    row: Row<Person>
    index: number
    onCellChange: (rowIndex: number, columnId: string, value: any,  rowId: number) => void
}

export const DataRow: React.FC<DataRowProps> = memo(({ row, index, onCellChange }) => {
    const render = useRef(0)
    useEffect(() =>{
        render.current++
    })

    return (
        < >
            {row.getVisibleCells().map((cell: Cell<any, any>) => {

                if (cell.column.id === "visits") return (
                    <td key={cell.column.id}>
                        <input
                            value={cell.getValue()}
                            onChange={e => onCellChange(index, cell.column.id, e.target.value, row.original.id)}
                        // onBlur={onBlur}
                        />
                    </td>
                )
                if (cell.column.id === "renders") return <td>{render.current}</td>
                return (
                    <td key={cell.column.id}>

                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </td>
                )
            })}
        </>
    );
})