import { makeAutoObservable } from "mobx";

export class Dialog {

    dialog: any = {};

    constructor() {
        makeAutoObservable(this)
    }

    setDialog(value: any) {
        this.dialog = value
    }

}