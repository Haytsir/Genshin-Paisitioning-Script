import { generateHashNumber } from "../libs/utils";

export class Dialog {
    public dialog: HTMLDivElement;
    public dialogTitle: HTMLHeadingElement;
    public dialogContentText: HTMLDivElement;
    public dialogMinimize: HTMLSpanElement;
    public dialogClose: HTMLSpanElement;
    public dialogContentProgress: HTMLDivElement;
    public dialogContentProgressIn: HTMLDivElement;
    private _isShowing: boolean = false;
    private _isMinimized: boolean = false;
    private _isProgressing: boolean = false;
    private _contentMessageHashNumber: number = 0;
    
    constructor() {
        this.dialog = document.createElement('div');
        this.dialog.className = 'gps-dialog';
    
        const dialogHeader = document.createElement('div');
        dialogHeader.className = 'gps-dialog-header';
        this.dialog.appendChild(dialogHeader);

        const dialogBtns = document.createElement('div');
        dialogBtns.className = 'gps-dialog-buttons';
        this.dialog.appendChild(dialogBtns);
    
        this.dialogTitle = document.createElement('h3');
        this.dialogTitle.className = 'gps-dialog-title';
        dialogHeader.append(this.dialogTitle);

        this.dialogMinimize = document.createElement('span');
        this.dialogMinimize.className = 'gps-dialog-minimize';
        this.dialogMinimize.innerHTML = '&#8213;';
        this.dialogMinimize.addEventListener('click', (e) => this.minimizeDialog(e));
        dialogBtns.append(this.dialogMinimize);
        
        this.dialogClose = document.createElement('span');
        this.dialogClose.className = 'gps-dialog-close';
        this.dialogClose.innerHTML = '&#215;';
        this.dialogClose.addEventListener('click', (e) => this.closeDialog(e, ""));
        dialogBtns.append(this.dialogClose);
    
        const dialogContent = document.createElement('div');
        dialogContent.className = 'gps-dialog-content';
        this.dialog.append(dialogContent);
    
        this.dialogContentText = document.createElement('div');
        this.dialogContentText.className = 'gps-dialog-content-text';
        dialogContent.append(this.dialogContentText)
    
        this.dialogContentProgress = document.createElement('div');
        this.dialogContentProgress.className = 'gps-dialog-progress';
        dialogContent.append(this.dialogContentProgress)
    
        this.dialogContentProgressIn = document.createElement('div');
        this.dialogContentProgressIn.className = 'gps-dialog-progress-in';
        this.dialogContentProgress.append(this.dialogContentProgressIn);
    }
    
    alertDialog(title: string, content: string, timeout: number=0, closable = false): void {
        this.dialogTitle.innerText = title;
        this.dialogContentText.innerText = content;
        this.dialog.classList.add('show');
        if (closable)
            this.dialog.classList.add('closable')
        else
            this.dialog.classList.remove('closable')
        this._isShowing = true;
        if(this._isMinimized) {
            this.dialog.classList.add('new');
            setTimeout(() => {
                this.dialog.classList.remove('new');
            }, 500);
        }
        generateHashNumber(content).then((hn: number) => {
            this._contentMessageHashNumber = hn;
        });

        if(timeout > 0) {
            setTimeout(() => {
                this.closeDialog(null, content);
            }, timeout);
        }
        
    }

    closeDialog(event: MouseEvent | null, content: string = ""): void {
        if(event == null) {
            generateHashNumber(content).then((hn) => {
                if(this._contentMessageHashNumber != hn)
                    return;
                
                this.dialog.classList.remove('show');
                this._isShowing = false;
            });
        } else {
            this.dialog.classList.remove('show');
            this._isShowing = false;
        }
        
    }

    minimizeDialog(_event: MouseEvent | null): void {
        if(this._isMinimized) {
            this.dialog.classList.remove('minimized');
            this.dialogMinimize.innerHTML = '&#8213;';
            this._isMinimized = false;
        } else {
            this.dialog.classList.add('minimized');
            this.dialogMinimize.innerHTML = '&#9635;';
            this._isMinimized = true;
        }
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