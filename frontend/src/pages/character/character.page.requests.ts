import axios from "axios";

export const getCharacterWeapons = async (body: any, token: any) => {
    
    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/weapons/achievements`, body, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const getCharacterArmors = async (body: any, token: any) => {
    
    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/armors/achievements`, body, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const getCharacterAbilities = async (level: any, token: any) => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/abilities/level/${level}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const getCharacter = async (id: any) => {
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/characters/${id}`)

    return data;
}

export const getCharactersSyncManager = async (token: any) => {
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/characters/sync`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    
    return data;
}

export const editCharactersSyncManager = async (id: any, body: any, token: any) => {
    let { data } = await axios.patch(`${process.env.REACT_APP_API_URL}/characters/sync/${id}`,
    body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const editCharacterClient = async (id: any, body: any, token: any) => {
    let { data } = await axios.patch(`${process.env.REACT_APP_API_URL}/characters/${id}`,
    body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}