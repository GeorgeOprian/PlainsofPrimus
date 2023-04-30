import Drawer from '@mui/material/Drawer';
import { observer } from 'mobx-react-lite';
import { toJS } from "mobx";
import { useContext } from 'react';
import { PanelContext } from '../../mobx/store';

const Panel = observer(() => {

    const panelState = useContext(PanelContext);

    return (
        <Drawer
            anchor="right"
            open={panelState.openPanel?.isActive}
            onClose={() => panelState.setOpenPanel({
                ...panelState.openPanel,
                isActive: false
            })}
        >
            <div
                style={{ width: "500px" }}
            >
                    {toJS(panelState.openPanel?.body)}
            </div>
        </Drawer>
    )
})

export default Panel;