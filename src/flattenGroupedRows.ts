
import { Row } from '@tanstack/react-table';

export type ExtendedRow<T> = {
  isAggregatedRow?: boolean;
} & Row<T>;

export const flattenGroupedRows = <T extends any>(
  rows: Array<ExtendedRow<T>>,
  hasAggCalculations: boolean = false
) => {
  const getSubRows = (row: Row<T>): Array<ExtendedRow<T>> | ExtendedRow<T> => {
    if (row.subRows.length && row.getIsExpanded()) {
      if (hasAggCalculations) {
        return [
          row,
          ...row.subRows.reduce(
            (srows, srow) => srows.concat(getSubRows(srow)),
            [] as Array<Row<T>>
          ),
          { ...row, isAggregatedRow: true },
        ];
      } else {
        return [
          row,
          ...row.subRows.reduce(
            (srows, srow) => srows.concat(getSubRows(srow)),
            [] as Array<Row<T>>
          ),
        ];
      }
    }
    return row;
  };

  return rows.reduce(
    (rows, row) => rows.concat(getSubRows(row)),
    [] as Array<Row<T>>
  );
};