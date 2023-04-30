import { Panel } from "./panel/panel";
import { createContext } from "react";
import { Toast } from "./toast/toast";
import { Dialog } from "./dialog/dialog";

export const PanelContext = createContext<Panel>(new Panel());
export const ToastContext = createContext<Toast>(new Toast());
export const DialogContext = createContext<Dialog>(new Dialog());