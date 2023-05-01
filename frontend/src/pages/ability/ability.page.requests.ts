import axios from "axios";


export const getAbilities = async () => {
    
    let { data } = await axios.get(`${process.env.REACT_APP_API_URL}/abilities`)

    return data;
}

export const editAbilityDB = async(body: any, id: number, token: any) => {

    let { data } = await axios.put(`${process.env.REACT_APP_API_URL}/abilities/${id}`, body,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    return data;
}

export const createAbilityDB = async(body: any, token: any) => {

    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/abilities`, body,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}

export const deleteAbilityDB = async (id: number, token: any) => {
    let { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/abilities/${id}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return data;
}
