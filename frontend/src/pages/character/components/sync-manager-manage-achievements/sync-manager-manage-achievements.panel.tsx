import { observer } from "mobx-react-lite"
import { useContext, useEffect, useState } from "react"
import { getAllAchievements } from "../../../achievements/achievements.page.requests"
import { Box, Button, Chip, FormControl, LinearProgress, MenuItem, OutlinedInput, Select, SelectChangeEvent } from "@mui/material"
import { Theme, useTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import { PanelContext, ToastContext } from "../../../../mobx/store";
import { editCharactersSyncManager } from "../../character.page.requests";
import useLocalStorage from "react-use-localstorage";

type SyncManageManageAchievementsPanelType = {
    characterDetails: CharachterDetailsTypes
}

type CharachterDetailsTypes = {
    characterId: string,
    name: string,
    level: number,
    achievements: any[]
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
};

function getStyles(name: string, achievements: readonly string[], theme: Theme) {
    return {
      fontWeight:
        achievements.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

const SyncManageManageAchievementsPanel = observer(({
    characterDetails
}: SyncManageManageAchievementsPanelType) => {

    const [achievements, setAchievements] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedAchievements, setSelectedAchievements] = useState<any[]>([])
    const panelState = useContext(PanelContext);
    const toastState = useContext(ToastContext);
    const [token, setToken] = useLocalStorage('userToken', '');

    const theme = useTheme();

    const handleChange = (event: SelectChangeEvent<typeof selectedAchievements>) => {
        const {
            target: { value },
        } = event;
        console.log(value)
        setSelectedAchievements(value as any[]);
    };

    useEffect(
        () => {
            if(!characterDetails) return;

            setSelectedAchievements(() => characterDetails.achievements)
        },
        [characterDetails]
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

    const editCarachtersAchievements = async () => {

        let body = {
            achievements: selectedAchievements,
            level: characterDetails.level
        }

        try {
            setLoading(() => true)
            await editCharactersSyncManager((characterDetails?.characterId as any), body, token);
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
        <div>
            {
                selectedAchievements?.length === 0 ?
                    <div
                        style={{
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            textAlign: "center",
                            padding: "1rem",
                            marginTop: "3rem"
                        }}
                    >
                        This character does not have achievements assigned!
                    </div>
                    :
                    <div
                        style={{
                            padding: "1rem",
                            marginTop: "3rem"
                        }}
                    >
                        <div
                            style={{
                                fontWeight: "bold",
                                fontSize: "1.5rem",
                                textAlign: "center",
                                padding: "1rem",
                            }}
                        >
                            This character has the following achievements:
                        </div>
                        <ul>
                            {
                                selectedAchievements?.map(m => (
                                    <li>{m.name}</li>
                                ))
                            }
                        </ul>
                    </div>
            }
            {
                loading ?
                    <LinearProgress color="success"/>
                :
                <div
                    style={{
                        paddingRight: "1rem",
                        paddingLeft: "1rem",
                        boxSizing: "border-box",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <FormControl>
                        <InputLabel id="demo-multiple-chip-label">Select achievements</InputLabel>
                        <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            multiple
                            value={selectedAchievements}
                            onChange={handleChange}
                            input={<OutlinedInput id="select-multiple-chip" label="Select achievements" />}
                            renderValue={(selected) => {
                                return (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value.achievementId} label={value.name} />
                                        ))}
                                    </Box>
                                ) 
                            }}
                            MenuProps={MenuProps}
                            >
                            {achievements?.map((achievement) => (
                                <MenuItem
                                    key={achievement.achievementId}
                                    value={achievement}
                                    // style={getStyles(achievement.name, achievements, theme)}
                                    >
                                    {achievement.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button  
                        variant="contained"
                        onClick={editCarachtersAchievements}
                        style={{
                            fontWeight: "bold",
                            marginTop: "0.5rem"
                        }}
                    >
                        Edit
                    </Button>
                </div>
            }
        </div>
    )
})

export default SyncManageManageAchievementsPanel;