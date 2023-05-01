import axios from "axios";

export const getArmors = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/armors`)

    return data;
}

export const getAllAchievements = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/achievements`)

    return data;
}

export const editArmorDB = async(body: any, id: number, token: any) => {

    let { data } = await axios.put(`${process.env.REACT_APP_API_URL}/armors/${id}`, body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const createArmorDB = async(body: any, token: any) => {

    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/armors`, body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const deleteArmorDB = async (id: number, token: any) => {
    let { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/armors/${id}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}