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
                    textAlign: "center"
                }}
            >
                Plains of Primus
            </div>
            <div
                style={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textAlign: "center",
                    paddingLeft: "0.5rem",
                    paddingRight: "1.5rem",
                    boxSizing: "border-box"
                }}
            >
                <p className="lead">Long before humans existed on the planet of Kratus, from outer space there came a being of immense power called Primus.</p>
                <p className="lead">He soon dominated the entire world and started forging the layout of the planet to be to his liking. But soon, he realized he wanted someone to aknoledge his power and genius, so he guided the most evolved species on the planet into becoming the sapient race of humans.</p>
                <p className="lead">In the present, no one knows why, but at some point the humans rebelled against Primus and managed to overthrow and kill him. Remnants of his body still remain today, in the place he was defeated, called the Plains of Primus, where different artifacts formed out of them.</p>
                <p className="lead">Embark on an adventure to recover a significant part of his lost power and maybe continue his legacy!</p>
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
                    Members:
                </div>
                <div
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        textAlign: "center"
                    }}
                >
                    <ul>
                        <li>Boranescu Alexandru-Nicolae</li>
                        <li>Giugioiu Marian</li>
                        <li>Oprian Adrian George</li>
                        <li>Pintilie Sabina</li>
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