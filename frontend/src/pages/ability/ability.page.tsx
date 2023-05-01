import { observer } from "mobx-react-lite";
import TableComponent from "../../components/table/table.component";
import { Snackbar } from "@mui/material";
import { useContext, useEffect, useMemo, useState } from "react";
import { DialogContext, PanelContext, ToastContext } from "../../mobx/store";
import useLocalStorage from "react-use-localstorage";
import { MenuActionItemsType, TableHeaderTypes } from "../../components/table/table.component.types";
import { deleteAbilityDB, getAbilities } from "./ability.page.requests";
import AbilityPanel from "./components/ability-panel/ability.panel";

const AbilityPage = observer(() => {

    const [abilities, setAbilities] = useState<any[]>()
    const [loading, setLoading] = useState<boolean>(true);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const dialogState = useContext(DialogContext);
    const [currentAbility, setCurrentAbility] = useState()
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

    const tableHeadersAbilities: TableHeaderTypes[] = useMemo(
        () => {
            return [
                {
                    style: styleHeader,
                    value: "Ability ID"
                },
                {
                    style: styleHeader,
                    value: "Name"
                },
                {
                    style: styleHeader,
                    value: "Level Requirement"
                },
                {
                    style: styleHeader,
                    value: "Scales with"
                },
                {
                    style: styleHeader,
                    value: "Effect"
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
                            body: (<AbilityPanel editAbility={currentAbility} />)
                        });
                    },
                    actionTitle: "Edit"
                },
                {
                    action: () => {
                        dialogState.setDialog({
                            open: true,
                            dialogTitle: "You delete the ability...",
                            dialogContent: "Are you sure?",
                            actionOne: () => {
                                dialogState.setDialog(undefined);
                            },
                            textButtonOne: "Cancel",
                            actionTwo: async () => {
                                try {
                                    await deleteAbilityDB((currentAbility as any).abilityId, token);
                                    dialogState.setDialog(undefined);
                                    panelState.setRefreshData({
                                        refreshAbilities: true
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
        [currentAbility, token]
    )

    const rowsAbilities: TableHeaderTypes[] = useMemo(
        () => {
            if(!abilities) return []

            return abilities.map(abilitie => {
                return {
                    value: abilitie
                }
            })
        },
        [abilities]
    )


    useEffect(
        () => {
            setLoading(() => true)
            getAbilities()
            .then(
                data => setAbilities(() => data)
            )
            .catch((e) => console.log(e))
            .finally(() => setLoading(() => false))
        },
        []
    )

    useEffect(
        () => {
            if(!panelState.refreshData?.refreshAbilities) return;

            setLoading(() => true)
            getAbilities()
            .then(
                data => {
                    setAbilities(() => data)
                    panelState.setRefreshData(undefined);
                }
            )
            .catch((e) => console.log(e))
            .finally(() => setLoading(() => false))
        },
        [panelState.refreshData]
    )

    const createPanel = () => {

        panelState.setOpenPanel({
            body: (<AbilityPanel />)
        });
        // setAnchorEl(null);
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
                    items: tableHeadersAbilities,
                    style: {
                        backgroundColor: "black",
                    }
                }}
                rows={rowsAbilities}
                menuActionItems={ role === "admin" ? {
                    actions: menuActionItems,
                    title: {
                        value: "Actions",
                        align: "right",
                        style: styleHeader
                    }
                } : undefined}
                rowDetails={(value) => setCurrentAbility(() => value)}
                loading={loading}
                headerButtonTitle="Create ability"
                headerButton={role === "admin" ? createPanel : undefined}
                title="Abilities"
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

export default AbilityPage;