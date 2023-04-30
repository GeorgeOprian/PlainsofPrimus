import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom"
import useLocalStorage from "react-use-localstorage";
import Typography from '@mui/material/Typography';

const Navigation = () => {

    const [token, setToken] = useLocalStorage('userToken', '');
    const navigate = useNavigate();

    const logout = () => {
        setToken("")
        navigate("/login")
    }   

    const linkStyle = {
        textDecoration: "none",
        color: "white"
    }

    return (
        <div style={{
            backgroundColor: "#585b87",
            padding: "2rem"
        }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                    fontSize: "1.4rem",
                    border: "1px solid white",
                    padding: "1rem",
                    backgroundColor: "#585b87",
                    borderRadius: "8px",
                    alignItems: "center"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexGrow: 1
                    }}
                >
                    <Link style={{...linkStyle}} to="/">Acasa</Link>
                    <Link style={{...linkStyle}} to="/weapons">Weapons</Link>
                    <Link style={{...linkStyle}} to="/achievements">Achievements</Link>
                </div>
                {
                    token ?
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "0.25rem"
                            }}
                        >
                            <Button
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "1.1rem",
                                    color: "white",
                                    
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