import { observer } from "mobx-react-lite";
import TableComponent from "../../components/table/table.component";
import { useContext, useEffect, useMemo, useState } from "react";
import { MenuActionItemsType, TableHeaderTypes } from "../../components/table/table.component.types";
import { TableRowsTypes } from "../../components/table/table.component.types";
import { deleteWeaponDB, getAchievements, getWeapons } from "./weapons.page.requests";
import { DialogContext, PanelContext, ToastContext } from "../../mobx/store";
import WeaponPanel from "./components/weapon-panel/weapons.panel";
import useLocalStorage from "react-use-localstorage";
import { Snackbar } from "@mui/material";

const WeaponsPage = observer(() => {

    const [weapons, setWeapons] = useState<any[]>()
    const [achievements, setAchievements] = useState<any[]>()
    const [loading, setLoading] = useState<boolean>(true);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const dialogState = useContext(DialogContext);
    const [currentWeapon, setCurrentWeapon] = useState()
    const [token, setToken] = useLocalStorage('userToken', '');

    const styleHeader = useMemo(
        () => {
            return {
                color: "white",
                fontWeight: "bold"
            }
        },
        []
    )

    const tableHeadersAchievements: TableHeaderTypes[] = useMemo(
        () => {
            return [
                {
                    style: styleHeader,
                    value: "Achievement ID"
                },
                {
                    style: styleHeader,
                    value: "Name"
                },
                {
                    style: styleHeader,
                    value: "Point"
                },
                {
                    style: styleHeader,
                    value: "Requirements"
                }
            ]
        },
        [styleHeader]
    )

    const tableHeadersWeapons: TableHeaderTypes[] = useMemo(
        () => {
            return [
                {
                    style: styleHeader,
                    value: "Weapon ID"
                },
                {
                    style: styleHeader,
                    value: "Name"
                },
                {
                    style: styleHeader,
                    value: "Attack damage"
                },
                {
                    style: styleHeader,
                    value: "Special bonus"
                },
                
                {
                    style: styleHeader,
                    value: "Achievement ID"
                },
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
                            body: (<WeaponPanel editWeapon={currentWeapon} />)
                        });
                    },
                    actionTitle: "Edit"
                },
                {
                    action: () => {
                        dialogState.setDialog({
                            open: true,
                            dialogTitle: "You delete the weapon...",
                            dialogContent: "Are you sure?",
                            actionOne: () => {
                                dialogState.setDialog(undefined);
                            },
                            textButtonOne: "Cancel",
                            actionTwo: async () => {
                                try {
                                    await deleteWeaponDB((currentWeapon as any).weaponId, token);
                                    dialogState.setDialog(undefined);
                                    panelState.setRefreshData({
                                        refreshWeapons: true
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
        [currentWeapon, token]
    )

    useEffect(
        () => {
            setLoading(() => true)
            getWeapons()
            .then(data => setWeapons(() => data))
            .catch(e => console.log(e))

            getAchievements()
            .then(data => {
                if(!data.message)
                    setAchievements(() => data)
            })
            .catch(e => console.log(e))
            .finally(() => setLoading(() => false))
        },
        []
    )

    useEffect(
        () => {
            if(!panelState.refreshData?.refreshWeapons) return;

            setLoading(() => true)
            getWeapons()
            .then(data => {
                setWeapons(() => data)
                panelState.setRefreshData(undefined);
            })
            .catch(e => console.log(e))

            getAchievements()
            .then(data => {
                if(!data.message)
                    setAchievements(() => data)
            })
            .catch(e => console.log(e))
            .finally(() => setLoading(() => false))
        },
        [panelState.refreshData]
    )

    const rowsAchievements: TableHeaderTypes[] = useMemo(
        () => {
            if(!achievements) return []

            return achievements.map(achievement => {
                return {
                    value: {
                        achievementId: achievement.achievementId,
                        name: achievement.name,
                        points: achievement.points,
                        requirements: achievement.requirements
                    }
                }
            })
        },
        [achievements]
    )

    const rowsWeapons: TableRowsTypes[] = useMemo(
        () => {
            if(!weapons) return []

            return weapons.map(weapon => {
                return {
                    value: {
                        weaponId: weapon.weaponId,
                        name: weapon.name,
                        attackDamage: weapon.attackDamage,
                        specialBonus: weapon.specialBonus,
                        achievementId: weapon.achievementId
                    }
                }
            })
        },
        [weapons]
    )

    const createPanel = () => {

        panelState.setOpenPanel({
            body: (<WeaponPanel />)
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
                    items: tableHeadersWeapons,
                    style: {
                        backgroundColor: "black",
                    }
                }}
                rows={rowsWeapons}
                menuActionItems={{
                    actions: menuActionItems,
                    title: {
                        value: "Actions",
                        align: "right",
                        style: styleHeader
                    }
                }}
                rowDetails={(value) => setCurrentWeapon(() => value)}
                loading={loading}
                headerButtonTitle="Create weapon"
                headerButton={createPanel}
                title="Weapons"
            />
            {
                achievements ?
                <TableComponent
                    tableHeaders={{
                        items: tableHeadersAchievements,
                        style: {
                            backgroundColor: "black",
                        }
                    }}
                    rows={rowsAchievements}
                    menuActionItems={{
                        actions: menuActionItems,
                        title: {
                            value: "Actions",
                            align: "right",
                            style: styleHeader
                        }
                    }}
                    rowDetails={(value) => console.log(value)}
                    loading={loading}
                />
                :
                ""
            }
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

export default WeaponsPage;