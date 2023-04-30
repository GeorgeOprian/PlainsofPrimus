import axios from "axios";

export const getWeapons = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/weapons`)

    return data;
}

export const getAllAchievements = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/achievements`)

    return data;
}

export const editWeaponDB = async(body: any, id: number, token: any) => {

    let { data } = await axios.put(`${process.env.REACT_APP_API_URL}/weapons/${id}`, body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const createWeaponDB = async(body: any, token: any) => {

    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/weapons`, body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const deleteWeaponDB = async (id: number, token: any) => {
    let { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/weapons/${id}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const getAchievements = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/weapons/achievements`)

    return data;
}