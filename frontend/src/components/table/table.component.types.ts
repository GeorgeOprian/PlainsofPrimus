export interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
      event: React.MouseEvent<HTMLButtonElement>,
      newPage: number,
    ) => void;
}

export type TableComponentPropsTypes = {
    tableHeaders: {
        items: TableHeaderTypes[],
        style: any
    },
    rows: TableRowsTypes[],
    loading?: boolean,
    headerButton?: () => any;
    headerButtonTitle?: string; 
    title?: string,
    rowDetails?: (value: any) => any,
    menuActionItems?: {
        actions: MenuActionItemsType[],
        title: TableHeaderTypes
    },
    closeAnchor?: () => void
}

export type TableHeaderTypes = {
    style?: any,
    align?: any,
    value: any
}

export type TableRowsTypes = {
    style?: any,
    align?: any,
    value: any
}

export type MenuActionItemsType = {
    action: () => void;
    actionTitle: string
}