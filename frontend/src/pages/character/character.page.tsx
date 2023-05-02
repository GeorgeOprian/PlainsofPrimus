import { observer } from "mobx-react-lite";
import { useContext, useEffect, useMemo, useState } from "react";
import { editCharacterClient, getCharacter, getCharacterAbilities, getCharacterArmors, getCharacterWeapons, getCharactersSyncManager } from "./character.page.requests";
import TableComponent from "../../components/table/table.component";
import { Autocomplete, Button, FormControl, FormGroup, LinearProgress, Snackbar, TextField } from "@mui/material";
import { DialogContext, PanelContext, ToastContext } from "../../mobx/store";
import useLocalStorage from "react-use-localstorage";
import jwt_decode from "jwt-decode";
import { MenuActionItemsType, TableHeaderTypes, TableRowsTypes } from "../../components/table/table.component.types";
import SyncManageManageAchievementsPanel from "./components/sync-manager-manage-achievements/sync-manager-manage-achievements.panel";
import { FormStyle } from "../register/register.page.style";
import { ArmorTypeEnum } from "../armor/components/armor-panel/armor.panel";

type CharacterType = {
    characterId: string,
    name: string,
    level: number,
    abilities: any[],
    achievements: any[], 
    points: number,
    weapon: any,
    helmet: any,
    chestplate: any,
    leggings: any,
    boots: any
}

const CharacterPage = observer(() => {

    const [characterWeapons, setCharacterWeapons] = useState()
    const [characterArmors, setCharacterArmors] = useState()
    const [characterAbilities, setCharacterAbilities] = useState()

    const [syncManagerCharacters, setSyncManagerCharacters] = useState<any[]>()

    const [character, setCharacter] = useState<CharacterType>()
    const [loading, setLoading] = useState<boolean>(true);
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const dialogState = useContext(DialogContext);
    const [token, setToken] = useLocalStorage('userToken', '');
    const [role, setRole] = useLocalStorage('userRole', '');
    const [currentCharacter, setCurrentCharacter] = useState()

    const styleHeader = useMemo(
        () => {
            return {
                color: "white",
                fontWeight: "bold"
            }
        },
        []
    )

    const changeState = (key: any, value: any) => {
        if(!character) return;

        setCharacter({
            ...character,
            [key]: value
        })
    }


    useEffect(
        () => {
            if(!token) return;
            if(role !== 'client') return; // se apeleaza doar daca pe cont este logat un client!

            let decode: any = jwt_decode(token);

            setLoading(() => true)
            getCharacter(decode.userId)
            .then(data => {
                setCharacter(() => data)
                getCharacterAbilities(data.level, token)
                .then(data => setCharacterAbilities(() => data))
                .catch(e => console.log(e))
    
                 getCharacterWeapons(data.achievements, token)
                .then(data => {
                    setCharacterWeapons(() => data)
                })
                .catch(e => console.log(e))
    
                getCharacterArmors(data.achievements, token)
                .then(data => {
                    setCharacterArmors(() => data)
                })
                .catch(e => console.log(e))
            })
            .catch(e => console.log(e))
            .finally(() => setLoading(() => false))
        },
        [token, role]
    )

    // useEffect(
    //     () => {
    //         if(!character) return;
    //         if(!role) return;
    //         if(!token) return;

    //         if(role !== 'client') return; // se apeleaza doar daca pe cont este logat un client!
            
    //         setLoading(() => true)
    //         getCharacterAbilities(character.level, token)
    //         .then(data => setCharacterAbilities(() => data))
    //         .catch(e => console.log(e))

    //          getCharacterWeapons(character.achievements, token)
    //         .then(data => {
    //             setCharacterWeapons(() => data)
    //         })
    //         .catch(e => console.log(e))

    //         getCharacterArmors(character.achievements, token)
    //         .then(data => {
    //             setCharacterArmors(() => data)
    //         })
    //         .catch(e => console.log(e))
    //         .finally(() => setLoading(() => false))
    //     },
    //     [character, token, role]
    // )


    useEffect(
        () => {
            if(!role) return;
            if(!token) return;

            
            if(role != 'sync_manager') return; // se apeleaza doar daca pe cont este logat un client!

            setLoading(() => true)
            getCharactersSyncManager(token)
            .then(data => {
                setSyncManagerCharacters(() => data)
            })
            .catch(e => console.log(e))
            .finally(() => setLoading(() => false))
        },
        [token, role]
    )

    const menuActionItems: MenuActionItemsType[] = useMemo(
        () => {

            if(!syncManagerCharacters || !currentCharacter) return [];

            let allFieldsCurrentCharacter = syncManagerCharacters?.find(f => f.characterId === (currentCharacter as any).characterId)

            return [
                {
                    action: () => {
                        panelState.setOpenPanel({
                            body: (<SyncManageManageAchievementsPanel characterDetails={allFieldsCurrentCharacter} />)
                        });
                    },
                    actionTitle: "Manage achievements"
                }
            ]
        },
        [currentCharacter, token , syncManagerCharacters]
    )

    const tableHeadersCharacters: TableHeaderTypes[] = useMemo(
        () => {
            if(!syncManagerCharacters) return []

            return [
                {
                    style: styleHeader,
                    value: "Character Id"
                },
                {
                    style: styleHeader,
                    value: "Name"
                },
                {
                    style: styleHeader,
                    value: "Level"
                }
            ]
        },
        [styleHeader, syncManagerCharacters]
    )

    const rowsCharacters: TableRowsTypes[] = useMemo(
        () => {
            if(!syncManagerCharacters) return []

            return syncManagerCharacters.map(syncManagerCharacter => {
                return {
                    value: {
                        characterId: syncManagerCharacter.characterId,
                        name: syncManagerCharacter.name,
                        level: syncManagerCharacter.level
                    }
                }
            })
        },
        [syncManagerCharacters]
    )

    const editCharacterClientAction = async () => {
        let body = {
            name: character?.name,
            weapon: character?.weapon,
            helmet: character?.helmet,
            chestplate: character?.chestplate,
            leggings: character?.leggings,
            boots: character?.boots,
            abilities: character?.abilities,
            achievements: character?.achievements,
        }

        try {
            setLoading(() => true)
            await editCharacterClient((character?.characterId as any), body, token);
            setLoading(() => false)
            panelState.closePanel();
            panelState.setRefreshData({
                refreshArmors: true
            });
            toastState.setToast({
                open: true,
                message: "The action was a success" 
            })
            
        } catch (error) {
            setLoading(() => false)
            toastState.setToast({
                open: true,
                message: "Error"
            })
        }
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
            {
                role === 'sync_manager' ? 
                    <TableComponent
                        tableHeaders={{
                            items: tableHeadersCharacters,
                            style: {
                                backgroundColor: "black",
                            }
                        }}
                        rows={rowsCharacters}
                        menuActionItems={{
                            actions: menuActionItems,
                            title: {
                                value: "Actions",
                                align: "right",
                                style: styleHeader
                            }
                        }}
                        rowDetails={(value) => setCurrentCharacter(() => value)}
                        loading={loading}
                        title="Sync Characters"
                    />
                    :
                    ""
            }
            {
                role === 'client' ?
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "3rem",
                            borderRadius: "8px"
                        }}
                    >
                        {
                            loading ?
                                <LinearProgress color="success"/>
                                :
                                <div>
                                    <FormGroup>
                                        
                                        <FormControl sx={{
                                            ...FormStyle
                                        }}>
                                            <TextField 
                                                label="Name"
                                                onChange={(e) => changeState("name", e.currentTarget.value) } 
                                                value={character?.name}
                                            />
                                        </FormControl>
                                        <FormControl
                                            sx={{
                                                ...FormStyle
                                            }}
                                        >
                                            <Autocomplete 
                                                options={(characterWeapons ?? []).map((weapon: any) => weapon)}
                                                renderInput={(params) => <TextField {...params} label="Weapons" />}
                                                getOptionLabel={(option) => option.name}
                                                onChange={(_, value) => changeState("weapon", value)}
                                                isOptionEqualToValue={(option, value) => option.weaponId === value.weaponId}
                                                value={character?.weapon}
                                            />
                                        </FormControl>
                                        <FormControl sx={{
                                            ...FormStyle
                                        }}>
                                            <Autocomplete 
                                                    options={(characterArmors ?? []).filter((f: any) => f.type === ArmorTypeEnum.Helmet).map((helmet: any) => helmet)}
                                                    renderInput={(params) => <TextField {...params} label="Helmet" />}
                                                    getOptionLabel={(option) => option.name}
                                                    onChange={(_, value) => changeState("helmet", value)}
                                                    isOptionEqualToValue={(option, value) => option.armorId === value.armorId}
                                                    value={character?.helmet}
                                                />
                                        </FormControl>
                                        <FormControl sx={{
                                            ...FormStyle
                                        }}>
                                            <Autocomplete 
                                                    options={(characterArmors ?? []).filter((f: any) => f.type === ArmorTypeEnum.Boots).map((boots: any) => boots)}
                                                    renderInput={(params) => <TextField {...params} label="Boots" />}
                                                    getOptionLabel={(option) => option.name}
                                                    onChange={(_, value) => changeState("boots", value)}
                                                    isOptionEqualToValue={(option, value) => option.armorId === value.armorId}
                                                    value={character?.boots}
                                                />
                                        </FormControl>
                                        <FormControl sx={{
                                            ...FormStyle
                                        }}>
                                            <Autocomplete 
                                                    options={(characterArmors ?? []).filter((f: any) => f.type === ArmorTypeEnum.Chestplate).map((chestplate: any) => chestplate)}
                                                    renderInput={(params) => <TextField {...params} label="Chestplate" />}
                                                    getOptionLabel={(option) => option.name}
                                                    onChange={(_, value) => changeState("chestplate", value)}
                                                    isOptionEqualToValue={(option, value) => option.armorId === value.armorId}
                                                    value={character?.chestplate}
                                                />
                                        </FormControl>
                                        <FormControl sx={{
                                            ...FormStyle
                                        }}>
                                            <Autocomplete 
                                                    options={(characterArmors ?? []).filter((f: any) => f.type === ArmorTypeEnum.Leggings).map((leggings: any) => leggings)}
                                                    renderInput={(params) => <TextField {...params} label="Leggings" />}
                                                    getOptionLabel={(option) => option.name}
                                                    onChange={(_, value) => changeState("leggings", value)}
                                                    isOptionEqualToValue={(option, value) => option.armorId === value.armorId}
                                                    value={character?.leggings}
                                                />
                                        </FormControl>
                                        <Button 
                                            variant="contained"
                                            onClick={editCharacterClientAction}
                                            style={{
                                                fontWeight: "bold"
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </FormGroup>
                                    <h2>Points: {character?.points}</h2>
                                </div>
                        }
                    </div>
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

export default CharacterPage;