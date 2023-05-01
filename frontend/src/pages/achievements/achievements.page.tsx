import { observer } from "mobx-react-lite";
import { useContext, useEffect, useMemo, useState } from "react";
import { DialogContext, PanelContext, ToastContext } from "../../mobx/store";
import { MenuActionItemsType, TableHeaderTypes } from "../../components/table/table.component.types";
import { getAllAchievements } from "../weapons/weapons.page.requests";
import TableComponent from "../../components/table/table.component";
import AcheivementPanel from "./components/achievement-panel/achievement.panel";
import useLocalStorage from "react-use-localstorage";
import { Snackbar } from "@mui/material";
import { deleteAchievementDB } from "./achievements.page.requests";

const AchievementsPage = observer(() => {

    const [achievements, setAchievements] = useState<any[]>()
    const [loading, setLoading] = useState<boolean>(true);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const dialogState = useContext(DialogContext);
    const [currentAchievement, setCurrentAchievement] = useState()
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

    const menuActionItems: MenuActionItemsType[] = useMemo(
        () => {
            return [
                {
                    action: () => {
                        panelState.setOpenPanel({
                            body: (<AcheivementPanel editAchievement={currentAchievement} />)
                        });
                    },
                    actionTitle: "Edit"
                },
                {
                    action: () => {
                        dialogState.setDialog({
                            open: true,
                            dialogTitle: "You delete the achievement...",
                            dialogContent: "Are you sure?",
                            actionOne: () => {
                                dialogState.setDialog(undefined);
                            },
                            textButtonOne: "Cancel",
                            actionTwo: async () => {
                                try {
                                    await deleteAchievementDB((currentAchievement as any).achievementId, token);
                                    dialogState.setDialog(undefined);
                                    panelState.setRefreshData({
                                        refreshAchievement: true
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
        [currentAchievement, token]
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


    useEffect(
        () => {
            setLoading(() => true)
            getAllAchievements()
            .then(
                data => setAchievements(() => data)
            )
            .catch((e) => console.log(e))
            .finally(() => setLoading(() => false))
        },
        []
    )

    useEffect(
        () => {
            if(!panelState.refreshData?.refreshAchievement) return;

            setLoading(() => true)
            getAllAchievements()
            .then(
                data => {
                    setAchievements(() => data)
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
            body: (<AcheivementPanel />)
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
                    items: tableHeadersAchievements,
                    style: {
                        backgroundColor: "black",
                    }
                }}
                rows={rowsAchievements}
                menuActionItems={role === "admin" ?{
                    actions: menuActionItems,
                    title: {
                        value: "Actions",
                        align: "right",
                        style: styleHeader
                    }
                } : undefined}
                rowDetails={(value) => setCurrentAchievement(() => value)}
                loading={loading}
                headerButtonTitle="Create achievement"
                headerButton={role === "admin" ? createPanel : undefined}
                title="Achievements"
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

export default AchievementsPage;