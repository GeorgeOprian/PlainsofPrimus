import { FormControl, FormGroup, TextField, Button, Snackbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useContext, useState } from "react";
import { FormStyle } from "./register.page.style";
import { isEmpty } from "lodash";
import { ToastContext } from "../../mobx/store";
import { createUser } from "./register.page.requests";
import useLocalStorage from "react-use-localstorage";
import { useNavigate } from "react-router-dom";

type RegisterFields = {
    nume: ValidationTypes,
    username: ValidationTypes,
    parola: ValidationTypes
}

type ValidationTypes = {
    value: string,
    isError: boolean
}
const RegisterPage = observer(() => {

    const [token, setToken] = useLocalStorage('userToken', '');
    const navigate = useNavigate();

    const [registerFields, setRegisterField] = useState<RegisterFields>({
        nume: {
            value: "",
            isError: false
        },
        username: {
            value: "",
            isError: false
        },
        parola: {
            value: "",
            isError: false
        },
    })
    const toastState = useContext(ToastContext);

    const changeState = (key: any, value: any) => {
        setRegisterField({
            ...registerFields,
            [key]: {
                value: value,
                isError: false
            }
        })
    }

    const registerAction = async () => {
        Object.keys(registerFields).map(m => {
            if(isEmpty((registerFields as any)[m].value.trim()))
                setRegisterField((state) => ({
                    ...state,
                    [m]: {
                        ...(state as any)[m],
                        isError: true
                    }
                }))
                
        })

        let isValid = Object.values(registerFields).map(m => m.isError).every(f => f === false);

        if(!isValid) {
            toastState.setToast({
                open: true,
                message: "Eroare"
            })
            return;
        }

        const body = {
            name: registerFields.nume.value,
            username: registerFields.username.value,
            password: registerFields.parola.value
        }

        try {
            const isUserCreated = await createUser(body);
            
            if(isUserCreated.userId) {
                navigate("/login");
                toastState.setToast({
                    open: true,
                    message: "Ai creat contul cu succes!"
                })
            } else {
                toastState.setToast({
                    open: true,
                    message: "A aparut o eroare, incearca din nou!"
                })
            }
        } catch (error) {
            toastState.setToast({
                open: true,
                message: `${error}`
            })
        }
    }

    return (
        <div
            style={{
                height: "85vh",
                width: "100vw",
                backgroundColor: "#585b87",
                paddingRight:"30rem",
                paddingLeft:"30rem",
                boxSizing: "border-box"
            }}
        >
            {
                !token ?
                    <FormGroup>
                        <FormControl 
                            sx={{
                                ...FormStyle
                            }}
                        >
                            <TextField 
                                variant="outlined"
                                label="Username"
                                onChange={(e) => changeState("username", e.currentTarget.value) } 
                                value={registerFields.username.value}
                                error={registerFields.username.isError}
                            />
                        </FormControl>
                        <FormControl 
                            sx={{
                                ...FormStyle
                            }}
                        >
                            <TextField 
                                variant="outlined"
                                label="Nume"
                                onChange={(e) => changeState("nume", e.currentTarget.value) } 
                                value={registerFields.nume.value}
                                error={registerFields.nume.isError}
                            />
                        </FormControl>
                        <FormControl 
                            sx={{
                                ...FormStyle
                            }}
                        >
                            <TextField 
                                variant="outlined"
                                label="Parola"
                                onChange={(e) => changeState("parola", e.currentTarget.value) } 
                                value={registerFields.parola.value}
                                error={registerFields.parola.isError}
                                type="password"
                            />
                        </FormControl>
                        <Button 
                            variant="contained"
                            onClick={() => registerAction()}
                            style={{
                                fontWeight: "bold"
                            }}
                        >
                            Register
                        </Button>
                    </FormGroup>
                    :
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <h1>Deja sunteti autentificat!</h1>
                    </div>
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
})

export default RegisterPage;