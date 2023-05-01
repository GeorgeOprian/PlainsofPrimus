import axios from "axios";

export const getCharacterWeapons = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/weapons/achievements`)

    return data;
}

export const getCharacterArmors = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/armors/achievements`)

    return data;
}