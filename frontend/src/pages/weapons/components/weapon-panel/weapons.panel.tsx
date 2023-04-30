import { observer } from "mobx-react-lite";
import { useContext, useEffect, useState } from "react";
import { PanelContext, ToastContext } from "../../../../mobx/store";
import { createWeaponDB, editWeaponDB, getAllAchievements } from "../../weapons.page.requests";
import { Autocomplete, Button, CircularProgress, FormControl, FormGroup, Snackbar, TextField } from "@mui/material";
import { FormStyle } from "./weapons.panel.style";
import useLocalStorage from "react-use-localstorage";

type WeaponPanelType = {
    editWeapon?: WeaponFields
}

type WeaponFields = {
    weaponId?: string,
    name: string,
    image: string,
    attackDamage: number,
    specialBonus: string,
    achievementId?: string | null,
    achievement?: any
}

const WeaponPanel = observer(({
    editWeapon
}: WeaponPanelType) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const [achievements, setAchievements] = useState<any[]>();
    const [token, setToken] = useLocalStorage('userToken', '');

    const [weaponFields, setWeaponFields] = useState<WeaponFields>({
        achievementId: null,
        attackDamage: 0,
        image: "",
        name: "",
        specialBonus: "",
        achievement: null
    })

    const changeState = (key: any, value: any) => {
        setWeaponFields({
            ...weaponFields,
            [key]: value
        })
    }

    useEffect(
        () => {
            if(!editWeapon || !achievements) return;
           
            setWeaponFields(() => ({
                achievement: achievements.find(m => m.achievementId === editWeapon.achievementId),
                attackDamage: editWeapon.attackDamage,
                image: "",
                name: editWeapon.name,
                specialBonus: editWeapon.specialBonus
            }));
        },
        [editWeapon, achievements]
    )

    useEffect(
        () => {
            setIsLoading(() => true)
            getAllAchievements()
            .then(
                data => setAchievements(() => data)
            )
            .catch((e) => console.log(e))
            .finally(() => setIsLoading(() => false))
        },
        []
    )

    const editWeaponAction = async () => {

        const body = {
            achievementId: weaponFields.achievementId,
            attackDamage: weaponFields.attackDamage,
            image: "",
            name: weaponFields.name,
            specialBonus: weaponFields.specialBonus
        }

        try {
            await editWeaponDB(body, (editWeapon?.weaponId as any), token);
            panelState.closePanel();
            panelState.setRefreshData({
                refreshWeapons: true
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

    const createWeaponAction = async () => {

        const body = {
            achievementId: weaponFields.achievement.achievementId,
            attackDamage: weaponFields.attackDamage,
            image: "",
            name: weaponFields.name,
            specialBonus: weaponFields.specialBonus
        }

        try {
            await  createWeaponDB(body, token);
            panelState.closePanel();
            panelState.setRefreshData({
                refreshWeapons: true
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
                                value={weaponFields.name}
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
                                label="Special bonus"
                                onChange={(e) => changeState("specialBonus", e.currentTarget.value) } 
                                value={weaponFields.specialBonus}
                            />
                        </FormControl>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Attack damage"
                                onChange={(e) => changeState("attackDamage", e.currentTarget.value) } 
                                value={weaponFields.attackDamage}
                            />
                        </FormControl>
                        {/* <FormControl sx={{
                            ...FormStyle
                        }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Data nastere"
                                    onChange={(e) => changeState("dataNastere", e) } 
                                    value={clientFields.dataNastere}
                                    format="DD.MM.YYYY"
                                    disableFuture
                                />
                            </LocalizationProvider>
                        </FormControl> */}
                        <FormControl
                            sx={{
                                ...FormStyle
                            }}
                        >
                            <Autocomplete 
                                options={(achievements ?? []).map((achievement: any) => achievement)}
                                renderInput={(params) => <TextField {...params} label="Achievement" />}
                                getOptionLabel={(option) => option.name}
                                onChange={(_, value) => changeState("achievement", value)}
                                isOptionEqualToValue={(option, value) => option.achievementId === value.achievementId}
                                value={weaponFields.achievement}
                            />
                        </FormControl>
                        <Button 
                            variant="contained"
                            onClick={() => {
                                if(editWeapon)
                                    editWeaponAction()  
                                else 
                                    createWeaponAction()
                            }}
                            style={{
                                fontWeight: "bold"
                            }}
                        >
                            {
                                editWeapon ?
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

export default WeaponPanel;