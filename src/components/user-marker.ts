export class UserMarker {
    public userMarker: HTMLDivElement;
    public userMarkerIcon: HTMLDivElement;
    constructor() {
        this.userMarker = document.createElement('div');
        this.userMarker.classList.add('gps-user-marker')
        this.userMarker.style.transformOrigin = 'center';

        this.userMarkerIcon = document.createElement('div');
        this.userMarkerIcon.classList.add('gps-user-position');
        this.userMarker.appendChild(this.userMarkerIcon);
    }
}