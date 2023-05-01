import { observer } from "mobx-react-lite";
import TableComponent from "../../components/table/table.component";
import { useContext, useEffect, useMemo, useState } from "react";
import { MenuActionItemsType, TableHeaderTypes } from "../../components/table/table.component.types";
import { TableRowsTypes } from "../../components/table/table.component.types";
import { DialogContext, PanelContext, ToastContext } from "../../mobx/store";
import useLocalStorage from "react-use-localstorage";
import { Snackbar } from "@mui/material";
import { deleteArmorDB, getArmors } from "./armor.page.requests";
import ArmorPanel from "./components/armor-panel/armor.panel";

const ArmorPage = observer(() => {

    const [armors, setArmors] = useState<any[]>()
    const [loading, setLoading] = useState<boolean>(true);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const dialogState = useContext(DialogContext);
    const [currentArmor, setCurrentArmor] = useState()
    const [token, setToken] = useLocalStorage('userToken', '');
    const [role, setRole] = useLocalStorage('userRole', '');

    const styleHeader = useMemo(
        () => {
            return {
                color: "white",
                fontWeight: "bold"
            }
        },
        []
    )

    const tableHeadersArmour: TableHeaderTypes[] = useMemo(
        () => {
            return [
                {
                    style: styleHeader,
                    value: "Armor ID"
                },
                {
                    style: styleHeader,
                    value: "Name"
                },
                {
                    style: styleHeader,
                    value: "Image"
                },
                {
                    style: styleHeader,
                    value: "Type"
                },
                {
                    style: styleHeader,
                    value: "Armor"
                },
                {
                    style: styleHeader,
                    value: "Health"
                },
                {
                    style: styleHeader,
                    value: "Strength"
                },
                {
                    style: styleHeader,
                    value: "Intellect"
                },
                {
                    style: styleHeader,
                    value: "Agility"
                },
                {
                    style: styleHeader,
                    value: "Achievement ID"
                }
            ]
        },
        [styleHeader]
    )

    const menuActionItems: MenuActionItemsType[] = useMemo(
        () => {
            return [
                {
                    action: () => {
                        panelState.setOpenPanel({
                            body: (<ArmorPanel editArmor={currentArmor} />)
                        });
                    },
                    actionTitle: "Edit"
                },
                {
                    action: () => {
                        dialogState.setDialog({
                            open: true,
                            dialogTitle: "You delete the armor...",
                            dialogContent: "Are you sure?",
                            actionOne: () => {
                                dialogState.setDialog(undefined);
                            },
                            textButtonOne: "Cancel",
                            actionTwo: async () => {
                                try {
                                    await deleteArmorDB((currentArmor as any).armorId, token);
                                    dialogState.setDialog(undefined);
                                    panelState.setRefreshData({
                                        refreshArmors: true
                                    });
                                    toastState.setToast({
                                        open: true,
                                        message: "The action was a success"
                                    });
                                } catch (error) {
                                    toastState.setToast({
                                        open: true,
                                        message: "Error"
                                    })
                                }
                                
                            },
                            textButtonTwo: "Delete"
                        })
                    },
                    actionTitle: "Delete"
                }
            ]
        },
        [currentArmor, token]
    )

    useEffect(
        () => {
            setLoading(() => true)
            getArmors()
            .then(data => setArmors(() => data))
            .catch(e => console.log(e))
            .finally(() => setLoading(() => false))
        },
        []
    )
    useEffect(
        () => {
            if(!panelState.refreshData?.refreshArmors) return;

            setLoading(() => true)
            getArmors()
            .then(data => {
                setArmors(() => data)
                panelState.setRefreshData(undefined);
            })
            .catch(e => console.log(e))
            .finally(() => setLoading(() => false))
        },
        [panelState.refreshData]
    )

    const rowsArmours: TableRowsTypes[] = useMemo(
        () => {
            if(!armors) return []

            return armors.map(armor => {
                return {
                    value: armor
                }
            })
        },
        [armors]
    )

    const createPanel = () => {

        panelState.setOpenPanel({
            body: (<ArmorPanel />)
        });
    }


    return (
        <div
            style={{
                paddingRight: "2rem",
                paddingLeft: "2rem",
                height: "100vh",
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "#585b87"
            }}
        >
            <TableComponent
                tableHeaders={{
                    items: tableHeadersArmour,
                    style: {
                        backgroundColor: "black",
                    }
                }}
                rows={rowsArmours}
                menuActionItems={ role === "admin" ? {
                    actions: menuActionItems,
                    title: {
                        value: "Actions",
                        align: "right",
                        style: styleHeader
                    }
                } : undefined}
                rowDetails={(value) => setCurrentArmor(() => value)}
                loading={loading}
                headerButtonTitle="Create armor"
                headerButton={role === "admin" ? createPanel : undefined}
                title="Armors"
            />
            <Snackbar
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                }}
                open={toastState.toast?.open}
                onClose={() => toastState.setToast(undefined)}
                message={toastState.toast?.message}   
                autoHideDuration={2500}
            />
        </div>
    )
})

export default ArmorPage;