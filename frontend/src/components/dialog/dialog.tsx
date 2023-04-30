import * as React from 'react';
import { observer } from "mobx-react-lite";
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { DialogContext } from '../../mobx/store';

const AlertDialog = observer(() => {
    
    const dialogState = React.useContext(DialogContext);

    return (
        <Dialog
            open={dialogState.dialog?.open ?? false}
            onClose={() => dialogState.setDialog(undefined)}
        >
            <DialogTitle>
                {dialogState.dialog?.dialogTitle}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {dialogState.dialog?.dialogContent}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dialogState.dialog?.actionOne()}>
                    {dialogState.dialog?.textButtonOne}
                </Button>
                <Button onClick={() => dialogState.dialog?.actionTwo()} >
                    {dialogState.dialog?.textButtonTwo}
                </Button>
            </DialogActions>
        </Dialog>
    )
})

export default AlertDialog;