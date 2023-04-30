import axios from "axios";


export const getAllAchievements = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/achievements`)

    return data;
}

export const editAchievementDB = async(body: any, id: number, token: any) => {

    let { data } = await axios.put(`${process.env.REACT_APP_API_URL}/achievements/${id}`, body,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    return data;
}

export const createAchievementDB = async(body: any, token: any) => {

    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/achievements`, body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const deleteAchievementDB = async (id: number, token: any) => {
    let { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/achievements/${id}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}
