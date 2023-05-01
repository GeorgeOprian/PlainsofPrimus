import { observer } from "mobx-react-lite";
import { useContext, useEffect, useState } from "react";
import { PanelContext, ToastContext } from "../../../../mobx/store";
import { Autocomplete, Button, CircularProgress, FormControl, FormGroup, Snackbar, TextField } from "@mui/material";
import { FormStyle } from "./armor.panel.style";
import useLocalStorage from "react-use-localstorage";
import { createArmorDB, editArmorDB, getAllAchievements } from "../../armor.page.requests";

enum ArmorTypeEnum {
    Chestplate = "chestplate",
    Helmet = "helmet",
    Leggings = "leggings",
    Boots = "boots"
}

type ArmorPanelType = {
    editArmor?: ArmorFields
}

type ArmorFields = {
    armorId?: string,
    name: string,
    image: string,
    type: ArmorTypeEnum,
    armor: number,
    health: number,
    strength: number,
    intellect: number,
    agility: number,
    achievementId?: string | null,
    achievement?: any
}

const ArmorPanel = observer(({
    editArmor
}: ArmorPanelType) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const [achievements, setAchievements] = useState<any[]>();
    const [token, setToken] = useLocalStorage('userToken', '');

    const [armorFields, setArmorFields] = useState<ArmorFields>({
        achievementId: null,
        armor: 0,
        health: 0,
        strength: 0,
        intellect: 0,
        agility: 0,
        image: "",
        name: "",
        type: ArmorTypeEnum.Chestplate,
        achievement: null
    })

    const changeState = (key: any, value: any) => {
        setArmorFields({
            ...armorFields,
            [key]: value
        })
    }

    useEffect(
        () => {
            if(!editArmor || !achievements) return;
           
            setArmorFields(() => ({
                achievement: achievements.find(m => m.achievementId === editArmor.achievementId),
                image: "",
                name: editArmor.name,
                agility: editArmor.agility,
                armor: editArmor.armor,
                health: editArmor.health,
                intellect: editArmor.health,
                strength: editArmor.strength,
                type: editArmor.type
            }));
        },
        [editArmor, achievements]
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

    const editArmorAction = async () => {

        const body = {
            image: "",
            name: armorFields.name,
            agility: armorFields.agility,
            armor: armorFields.armor,
            health: armorFields.health,
            intellect: armorFields.health,
            strength: armorFields.strength,
            type: armorFields.type,
            achievementId: armorFields.achievement.achievementId
        }

        try {
            setIsLoading(() => true)
            await editArmorDB(body, (editArmor?.armorId as any), token);
            setIsLoading(() => false)
            panelState.closePanel();
            panelState.setRefreshData({
                refreshArmors: true
            });
            toastState.setToast({
                open: true,
                message: "The action was a success" 
            })
            
        } catch (error) {
            setIsLoading(() => false)
            toastState.setToast({
                open: true,
                message: "Error"
            })
        }
    }

    const createArmorAction = async () => {

        const body = {
            image: "",
            name: armorFields.name,
            agility: armorFields.agility,
            armor: armorFields.armor,
            health: armorFields.health,
            intellect: armorFields.health,
            strength: armorFields.strength,
            type: armorFields.type,
            achievementId: armorFields.achievement.achievementId
        }

        try {
            setIsLoading(() => true)
            await  createArmorDB(body, token);
            setIsLoading(() => false)
            panelState.closePanel();
            panelState.setRefreshData({
                refreshArmors: true
            });
            toastState.setToast({
                open: true,
                message: "The action was a success" 
            })
            
        } catch (error) {
            setIsLoading(() => false)
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
                                value={armorFields.name}
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
                                label="Armor"
                                onChange={(e) => changeState("armor", e.currentTarget.value) } 
                                value={armorFields.armor}
                                type="number"
                            />
                        </FormControl>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Health"
                                onChange={(e) => changeState("health", e.currentTarget.value) } 
                                value={armorFields.health}
                                type="number"
                            />
                        </FormControl>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Strength"
                                onChange={(e) => changeState("strength", e.currentTarget.value) } 
                                value={armorFields.strength}
                                type="number"
                            />
                        </FormControl>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Intellect"
                                onChange={(e) => changeState("intellect", e.currentTarget.value) } 
                                value={armorFields.intellect}
                                type="number"
                            />
                        </FormControl>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Agility"
                                onChange={(e) => changeState("agility", e.currentTarget.value) } 
                                value={armorFields.agility}
                                type="number"
                            />
                        </FormControl>
                        <FormControl
                            sx={{
                                ...FormStyle
                            }}
                        >
                            <Autocomplete 
                                options={(Object.values(ArmorTypeEnum) ?? []).map((armorType: any) => armorType)}
                                renderInput={(params) => <TextField {...params} label="Type" />}
                                getOptionLabel={(option) => option}
                                onChange={(_, value) => changeState("type", value)}
                                isOptionEqualToValue={(option, value) => option === value}
                                value={armorFields.type}
                            />
                        </FormControl>
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
                                value={armorFields.achievement}
                            />
                        </FormControl>
                        <Button 
                            variant="contained"
                            onClick={() => {
                                if(editArmor)
                                    editArmorAction()  
                                else 
                                    createArmorAction()
                            }}
                            style={{
                                fontWeight: "bold"
                            }}
                        >
                            {
                                editArmor ?
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

export default ArmorPanel;