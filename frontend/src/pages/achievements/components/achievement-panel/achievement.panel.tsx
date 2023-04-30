import { observer } from "mobx-react-lite";
import { useCallback, useContext, useEffect, useState } from "react";
import { PanelContext, ToastContext } from "../../../../mobx/store";
import { Autocomplete, Button, CircularProgress, FormControl, FormGroup, Snackbar, TextField } from "@mui/material";
import { FormStyle } from "./achievement.panel.style";
import { createAchievementDB, editAchievementDB } from "../../achievements.page.requests";
import useLocalStorage from "react-use-localstorage";

type AchievementPanelType = {
    editAchievement?: AchievementFields
}

type AchievementFields = {
    achievementId?: string,
    name: string,
    points: number,
    requirements: string
}

const AcheivementPanel = observer(({
    editAchievement
}: AchievementPanelType) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const [token, setToken] = useLocalStorage('userToken', '');
    
    const [achievementsFields, setAchievementsFields] = useState<AchievementFields>({
        points: 0,
        name: "",
        requirements: "",
    })

    const changeState = (key: any, value: any) => {
        setAchievementsFields({
            ...achievementsFields,
            [key]: value
        })
    }

    useEffect(
        () => {
            if(!editAchievement) return;
           
            setAchievementsFields(() => ({
                name: editAchievement.name,
                points: editAchievement.points,
                requirements: editAchievement.requirements
            }));
        },
        [editAchievement]
    )

    const editAchievementAction = async () => {

        const body = {
            name: achievementsFields.name,
            points: achievementsFields.points,
            requirements: achievementsFields.requirements
        }

        try {
            setIsLoading(() => true)
            await editAchievementDB(body, (editAchievement?.achievementId as any), token);
            setIsLoading(() => false)
            panelState.closePanel();
            panelState.setRefreshData({
                refreshAchievement: true
            });
            toastState.setToast({
                open: true,
                message: "The action was a success"
            })
            
        } catch (error) {
            toastState.setToast({
                open: true,
                message: "Error"
            })
        }
    }

    const createAchievementAction = async () => {

        const body = {
            name: achievementsFields.name,
            points: achievementsFields.points,
            requirements: achievementsFields.requirements
        }

        try {
            await  createAchievementDB(body, token);
            panelState.closePanel();
            panelState.setRefreshData({
                refreshAchievement: true
            });
            toastState.setToast({
                open: true,
                message: "The action was a success"
            })
            
        } catch (error) {
            toastState.setToast({
                open: true,
                message: "Error"
            })
        }
    }

    return (
        <div
            style={{
                padding: "2rem"
            }}
        >
            {
                isLoading ?
                    <CircularProgress />
                    :
                    <FormGroup>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                variant="outlined"
                                label="Name"
                                onChange={(e) => changeState("name", e.currentTarget.value) } 
                                value={achievementsFields.name}
                            />
                        </FormControl>
                        {/* <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Image"
                                onChange={(e) => changeState("image", e.currentTarget.value) } 
                                value={weaponFields.image}
                            />
                        </FormControl> */}
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Points"
                                onChange={(e) => changeState("points", e.currentTarget.value) } 
                                value={achievementsFields.points}
                                type="number"
                            />
                        </FormControl>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Requirements"
                                onChange={(e) => changeState("requirements", e.currentTarget.value) } 
                                value={achievementsFields.requirements}
                            />
                        </FormControl>
                        <Button 
                            variant="contained"
                            onClick={() => {
                                if(editAchievement)
                                    editAchievementAction()  
                                else 
                                    createAchievementAction()
                            }}
                            style={{
                                fontWeight: "bold"
                            }}
                        >
                            {
                                editAchievement ?
                                    'Edit'
                                    :
                                    'Create'
                            }
                        </Button>
                    </FormGroup>

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

export default AcheivementPanel;