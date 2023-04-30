import axios from "axios";

export const createUser = async(body: any) => {

    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, body)

    return data;
}