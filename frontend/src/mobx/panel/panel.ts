import { makeAutoObservable } from "mobx";

type PanelTypes = {
    isActive?: boolean,
    closeModal?: () => void;
    title?: string,
    body?: any,
    footer?: any,
    onDismiss?: (data: any) => void;
}

export class Panel {

    openPanel: PanelTypes = {};
    refreshData: any;

    constructor() {
        makeAutoObservable(this)
    }

    setOpenPanel(panel: PanelTypes) {
        this.openPanel = {
            isActive: true,
            ...panel
        }
    }

    closePanel() {
        this.openPanel = {}
    }

    setRefreshData(value: any) {
        this.refreshData = value;
    }
}