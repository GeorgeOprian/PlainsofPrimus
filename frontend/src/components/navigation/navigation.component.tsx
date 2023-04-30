import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom"
import useLocalStorage from "react-use-localstorage";

const Navigation = () => {

    const [token, setToken] = useLocalStorage('userToken', '');
    const navigate = useNavigate();

    const logout = () => {
        setToken("")
        navigate("/login")
    }   

    return (
        <div style={{
            backgroundColor: "rgb(245, 237, 228)",
            padding: "2rem"
        }}>
            <div
                style={{
                    display: "flex",
                    fontWeight: "bold",
                    fontSize: "1.4rem",
                    border: "1px solid black",
                    padding: "1rem",
                    justifyContent: "space-between",
                    backgroundColor: "rgb(245, 237, 228)",
                    borderRadius: "8px"
                }}
            >
                <div>
                    <Link to="/">Acasa</Link>
                </div>
                {
                    token ?
                        <div>
                            <Button
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "1.1rem",
                                    color: "black"
                                }}
                                onClick={() => logout()}
                            >
                                Logout
                            </Button>
                        </div>
                        :
                        ""
                }
                {/* <Link to="/apartments">Apartamente</Link>
                <Link to="/addresses">Adrese</Link>
                <Link to="/agents">Agenti</Link>
                <Link to="/clients">Clienti</Link>
                <Link to="/contracts">Contracte</Link>
                <Link to="/payrent">Plata Chirie</Link> */}
                
            </div>

        </div>
    )
}

export default Navigation;