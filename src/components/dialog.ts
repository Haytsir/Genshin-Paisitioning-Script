import { generateHashNumber } from "../libs/utils";

interface DialogOpenEvent {
    title: string;
    content: string;
    closable: boolean;
}

export class Dialog {
    public dialog: HTMLDivElement;
    public dialogTitle: HTMLHeadingElement;
    public dialogContentText: HTMLDivElement;
    public dialogMinimize: HTMLDivElement;
    public dialogClose: HTMLDivElement;
    public dialogContentProgress: HTMLDivElement;
    public dialogContentProgressIn: HTMLDivElement;
    private _isShowing: boolean = false;
    private _isMinimized: boolean = false;
    private _isProgressing: boolean = false;
    private _callerFunction: string | null = null;
    private _contentMessageHashNumber: number = 0;
    
    constructor() {
        this.dialog = document.createElement('div');
        this.dialog.className = 'gps-dialog';
    
        const dialogHeader = document.createElement('div');
        dialogHeader.className = 'gps-dialog-header';
        this.dialog.appendChild(dialogHeader);
    
        this.dialogTitle = document.createElement('h3');
        this.dialogTitle.className = 'gps-dialog-title';
        dialogHeader.append(this.dialogTitle);

        this.dialogMinimize = document.createElement('div');
        this.dialogMinimize.className = 'gps-dialog-close';
        this.dialogMinimize.addEventListener('click', this.minimizeDialog);
        dialogHeader.append(this.dialogMinimize);
        
        this.dialogClose = document.createElement('div');
        this.dialogClose.className = 'gps-dialog-close';
        this.dialogClose.addEventListener('click', () => this.closeDialog(null, "", null));
        dialogHeader.append(this.dialogClose);
    
        const dialogContent = document.createElement('div');
        dialogContent.className = 'gps-dialog-content';
        this.dialog.append(dialogContent);
    
        this.dialogContentText = document.createElement('div');
        this.dialogContentText.className = 'gps-dialog-content-text';
        dialogContent.append(this.dialogContentText)
    
        this.dialogContentProgress = document.createElement('div');
        this.dialogContentProgress.className = 'gps-dialog-content-text';
        dialogContent.append(this.dialogContentProgress)
    
        this.dialogContentProgressIn = document.createElement('div');
        this.dialogContentProgressIn.className = 'gps-dialog-progress-in';
        this.dialogContentProgress.append(this.dialogContentProgressIn);
    }
    
    alertDialog(title: string, content: string, callerFunc: string | null = null, closable = false): void {
        this.dialog.dispatchEvent(new CustomEvent<DialogOpenEvent>("alert",{detail:{title, content, closable}}));
        this.dialogTitle.innerText = title;
        this.dialogContentText.innerText = content;
        this.dialog.classList.add('show');
        this.dialogClose.style.display = closable ? 'block' : 'none';
        this._isShowing = true;
        this._callerFunction = callerFunc;
        generateHashNumber(content).then((hn: number) => {
            this._contentMessageHashNumber = hn;
        });
        
    }

    closeDialog(event: MouseEvent | null, content: string = "", callerFunc: string | null = null): void {
        generateHashNumber(content).then((hn) => {
            if(this._contentMessageHashNumber != hn && !(event != null && callerFunc == null))
                return;
            if((event != null && callerFunc == null) || this._callerFunction == callerFunc) {
                this.dialog.dispatchEvent(new CustomEvent<undefined>("close",{detail:undefined}));
                this.dialogClose.classList.remove('show');
                this._isShowing = false;
            }
        });
    }

    minimizeDialog(_event: MouseEvent | null): void {
        this.dialog.dispatchEvent(new CustomEvent<undefined>("minimize",{detail:undefined}));
        this.dialog.classList.remove('show');
        this._isMinimized = true;
    }

    showProgress(): void {
        this.dialogContentProgress.style.display = 'block';
        this.dialogContentProgressIn.style.width = '0%';
        this._isProgressing = true;
    }

    changeProgress(percent: number): void {
        if(this._isProgressing)
            this.dialogContentProgressIn.style.width = `${percent}%`;
    }
    
    hideProgress(): void {
        this.dialogContentProgress.style.display = 'none';
        this.dialogContentProgressIn.style.width = '0%';
        this._isProgressing = false;
    }

    public get isShowing(): boolean {
        return this._isShowing;
    }
    public get isMinimized(): boolean {
        return this._isMinimized;
    }
    public get isProgressing(): boolean {
        return this._isProgressing;
    }
    
}