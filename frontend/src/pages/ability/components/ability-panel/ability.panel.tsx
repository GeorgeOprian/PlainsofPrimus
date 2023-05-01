import { observer } from "mobx-react-lite";
import { useCallback, useContext, useEffect, useState } from "react";
import { PanelContext, ToastContext } from "../../../../mobx/store";
import { Autocomplete, Button, CircularProgress, FormControl, FormGroup, Snackbar, TextField } from "@mui/material";
import { FormStyle } from "./ability.panel.style";
import useLocalStorage from "react-use-localstorage";
import { createAbilityDB, editAbilityDB } from "../../ability.page.requests";

enum AbilityScalesWithEnum {
    Strength = "strength",
    Intellect = "intellect",
    Agility = "agility"
}

type AbilityPanelType = {
    editAbility?: AbilityFields
}

type AbilityFields = {
    abilityId?: string,
    name: string,
    levelRequirement: number,
    scalesWith: AbilityScalesWithEnum,
    effect: string
}

const AbilityPanel = observer(({
    editAbility
}: AbilityPanelType) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const [token, setToken] = useLocalStorage('userToken', '');
    
    const [abilitiesFields, setAbilitiesFields] = useState<AbilityFields>({
        name: "",
        effect: "",
        levelRequirement: 0,
        scalesWith: AbilityScalesWithEnum.Agility
    })

    const changeState = (key: any, value: any) => {
        setAbilitiesFields({
            ...abilitiesFields,
            [key]: value
        })
    }

    useEffect(
        () => {
            if(!editAbility) return;
           
            setAbilitiesFields(() => ({
                effect: editAbility.effect,
                levelRequirement: editAbility.levelRequirement,
                name: editAbility.name,
                scalesWith: editAbility.scalesWith
            }));
        },
        [editAbility]
    )

    const editAbilityAction = async () => {

        const body = {
            effect: abilitiesFields.effect,
            levelRequirement: abilitiesFields.levelRequirement,
            name: abilitiesFields.name,
            scalesWith: abilitiesFields.scalesWith
        }

        try {
            setIsLoading(() => true)
            await editAbilityDB(body, (editAbility?.abilityId as any), token);
            setIsLoading(() => false)
            panelState.closePanel();
            panelState.setRefreshData({
                refreshAbilities: true
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

    const createAbilityAction = async () => {

        const body = {
            effect: abilitiesFields.effect,
            levelRequirement: abilitiesFields.levelRequirement,
            name: abilitiesFields.name,
            scalesWith: abilitiesFields.scalesWith
        }

        try {
            await  createAbilityDB(body, token);
            panelState.closePanel();
            panelState.setRefreshData({
                refreshAbilities: true
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
                                value={abilitiesFields.name}
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
                                label="Effect"
                                onChange={(e) => changeState("effect", e.currentTarget.value) } 
                                value={abilitiesFields.effect}
                            />
                        </FormControl>
                        <FormControl sx={{
                            ...FormStyle
                        }}>
                            <TextField 
                                label="Level requirement"
                                onChange={(e) => changeState("levelRequirement", e.currentTarget.value) } 
                                value={abilitiesFields.levelRequirement}
                                type="number"
                            />
                        </FormControl>
                        <FormControl
                            sx={{
                                ...FormStyle
                            }}
                        >
                            <Autocomplete 
                                options={(Object.values(AbilityScalesWithEnum) ?? []).map((armorType: any) => armorType)}
                                renderInput={(params) => <TextField {...params} label="Scales with" />}
                                getOptionLabel={(option) => option}
                                onChange={(_, value) => changeState("scalesWith", value)}
                                isOptionEqualToValue={(option, value) => option === value}
                                value={abilitiesFields.scalesWith}
                            />
                        </FormControl>
                        <Button 
                            variant="contained"
                            onClick={() => {
                                if(editAbility)
                                    editAbilityAction()  
                                else 
                                    createAbilityAction()
                            }}
                            style={{
                                fontWeight: "bold"
                            }}
                        >
                            {
                                editAbility ?
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

export default AbilityPanel;