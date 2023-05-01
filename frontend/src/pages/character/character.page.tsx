import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { getCharacterArmors, getCharacterWeapons } from "./character.page.requests";

const CharacterPage = observer(() => {

    const [characterWeapons, setCharacterWeapons] = useState()
    const [characterArmors, setCharacterArmors] = useState()
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(
        () => {
            getCharacterWeapons()
            .then(data => {
                setCharacterWeapons(() => data)
            })
            .catch(e => console.log(e))

            getCharacterArmors()
            .then(data => {
                setCharacterWeapons(() => data)
            })
            .catch(e => console.log(e))
            .finally(() => setLoading(() => false))
        },
        []
    )

    return (
        <></>
    )
})

export default CharacterPage;