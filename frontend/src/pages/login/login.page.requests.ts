import axios from "axios";

export const loginUser = async(body: any) => {

    let { data } = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, body)

    return data;
}