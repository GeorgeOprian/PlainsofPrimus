import { makeAutoObservable } from "mobx";

export class Toast {

    toast: any = {};

    constructor() {
        makeAutoObservable(this)
    }

    setToast(value: any) {
        this.toast = value
    }

}