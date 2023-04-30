import { Autocomplete, Button, CircularProgress, FormControl, FormGroup, Input, InputLabel, MenuItem, Select, Snackbar, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import useLocalStorage from "react-use-localstorage";
import { ToastContext } from "../../mobx/store";
import { useContext } from "react";

const HomePage = () => {
    const [token, setToken] = useLocalStorage('userToken', '');
    const toastState = useContext(ToastContext);

    return (
        <div
            style={{
                height: "85vh",
                width: "100vw",
                backgroundColor: "#585b87",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "white"
            }}
        >
            <div
                style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textAlign: "center"
                }}
            >
                Proiect Data Warehouse & Business Intelligence
            </div>
            <div
                style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    textAlign: "center"
                }}
            >
                Platforma de inchiriere
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <div
                    style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        marginTop: "5rem"
                    }}
                >
                    Membrii echipei:
                </div>
                <div
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        textAlign: "center"
                    }}
                >
                    <ul>
                        <li>Oprian Adrian George</li>
                        <li>Pintilie Sabina</li>
                        <li>Marian Giugioiu</li>
                        <li>Boranescu Alexandru-Nicolae</li>
                    </ul>
                </div>
            </div>
            {
                !token ?
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Link 
                            to="/login" 
                            style={{
                                padding: "1rem",
                                border: "1px solid black",
                                backgroundColor: "transparent",
                                fontWeight: "bold",
                                fontSize: "1.5rem",
                                color: "black",
                                textDecoration: "none",
                                borderRadius: "8px",
                                marginRight: "0.5rem"
                            }}
                        >
                            Login
                        </Link>
                        <Link 
                            to="/register" 
                            style={{
                                padding: "1rem",
                                border: "1px solid black",
                                backgroundColor: "transparent",
                                fontWeight: "bold",
                                fontSize: "1.5rem",
                                color: "black",
                                textDecoration: "none",
                                borderRadius: "8px"
                            }}
                        >
                            Register
                        </Link>
                    </div>
                    :
                    ""
            }
            <Snackbar
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                }}
                open={toastState.toast?.open}
                onClose={() => toastState.setToast(undefined)}
                message={toastState.toast?.message}   
                autoHideDuration={2500}
            />
        </div>
    )
}

export default HomePage;