import { Box, Button, IconButton, LinearProgress, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { TableComponentPropsTypes, TablePaginationActionsProps } from "./table.component.types";
import { useTheme } from '@mui/material/styles';
import { isEmpty } from "lodash";
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ITEM_HEIGHT = 48;

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, page + 1);
    };
  
  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
}

const TableComponent = observer(({
    loading,
    rows,
    tableHeaders,
    headerButton,
    title,
    headerButtonTitle,
    rowDetails,
    menuActionItems
}: TableComponentPropsTypes) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
      ) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div>
            <div 
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <h1>{title}</h1>
                {
                    headerButton ?
                        <div>
                            <Button
                                onClick={() => {
                                    headerButton()
                                    setAnchorEl(null)
                                }}
                                variant="contained"
                                style={{
                                    fontWeight: "bold"
                                }}
                            >
                                {headerButtonTitle}
                            </Button>
                        </div>
                        :
                        ""
                }
            </div>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                    <TableHead sx={{ ...tableHeaders.style}}>
                        <TableRow>
                            {
                                tableHeaders.items.map(header => (
                                    <TableCell 
                                        sx={{ ...header.style }} 
                                        align={isEmpty(header.align) ? 'center' : header.align}
                                        key={header.value}
                                    >
                                        {header.value}
                                    </TableCell>
                                ))
                            }
                            {
                                menuActionItems ?
                                    <TableCell 
                                        sx={{ ...menuActionItems.title.style }} 
                                        align={isEmpty(menuActionItems.title.align) ? 'center' : menuActionItems.title.align}
                                    >
                                        {menuActionItems.title.value}
                                    </TableCell>
                                    :
                                    ""
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {
                            loading ?
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <LinearProgress color="success"/>
                                    </TableCell>
                                </TableRow>
                                :
                                <>
                                    {(rowsPerPage > 0
                                        ? (rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? [])
                                        : (rows ?? [])
                                    ).map((row, index) => (
                                        <TableRow key={index}>
                                            {
                                                Object.values(row.value).map((value: any, i: number) => (
                                                    <TableCell 
                                                        sx={{ ...row.style }} 
                                                        align={isEmpty(row.align) ? 'center' : row.align}
                                                        key={`${value}${i}`}
                                                    >
                                                        {value}
                                                    </TableCell>
                                                ))
                                            }
                                            {
                                                menuActionItems ?
                                                    <TableCell align="right">
                                                        <IconButton
                                                            aria-label="more"
                                                            id="long-button"
                                                            aria-controls={open ? 'long-menu' : undefined}
                                                            aria-expanded={open ? 'true' : undefined}
                                                            aria-haspopup="true"
                                                            onClick={(e) => {
                                                                handleClick(e);

                                                                if(rowDetails)
                                                                    rowDetails(row.value) 
                                                            }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                        <Menu
                                                            id="long-menu"
                                                            MenuListProps={{
                                                                'aria-labelledby': 'long-button',
                                                            }}
                                                            anchorEl={anchorEl}
                                                            open={open}
                                                            onClose={handleClose}
                                                            PaperProps={{
                                                                style: {
                                                                    maxHeight: ITEM_HEIGHT * 4.5,
                                                                    // width: '20ch',
                                                                },
                                                            }}
                                                        >
                                                            {
                                                                menuActionItems.actions?.map(m => (
                                                                    <MenuItem 
                                                                        onClick={() => {
                                                                            m.action()
                                                                            setAnchorEl(null)
                                                                        }}
                                                                        key={m.actionTitle}
                                                                    >
                                                                        {m.actionTitle}
                                                                    </MenuItem>
                                                                ))
                                                            }
                                                        </Menu>
                                                    </TableCell> 
                                                    :
                                                    ""
                                            }
                                        </TableRow>
                                    ))}
                                </>
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={
                                menuActionItems ? tableHeaders.items.length + 1 : tableHeaders.items.length
                            }
                            count={rows?.length ?? 0}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {
                                'aria-label': 'rows per page',
                                },
                                native: true,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </div>
    )
})

export default TableComponent;