import {Component, Output, EventEmitter} from '@angular/core';
import {NgClass} from '@angular/common';
import {PopoverController, ToastController, NavController, ModalController} from 'ionic-angular';

//Pages
import {TestChartCtrlsPage} from '../../../../pages/test-chart-ctrls/test-chart-ctrls';
import {DeviceConfigureModal} from '../../../../pages/device-configure-modal/device-configure-modal';

//Components
import {GenPopover} from '../../../../components/gen-popover/gen-popover.component';

//Services
import {DeviceManagerService} from '../../../../services/device/device-manager.service';
import {StorageService} from '../../../../services/storage/storage.service';

@Component({
  templateUrl: 'build/pages/device-manager-page/device-manager-tabs/device-manager-tab1/device-manager-tab1.html',
  directives: [NgClass]
})
export class Tab1 {
    @Output() navToInstrumentPage: EventEmitter<any> = new EventEmitter;
    private popoverCtrl: PopoverController;
    private toastCtrl: ToastController;
    private modalCtrl: ModalController;
    private navCtrl: NavController;
    private addDeviceIp: string;
    private deviceManagerService: DeviceManagerService;
    private storage: StorageService;
    private showDevMenu: boolean = false;
    private connectingToDevice: boolean = false;

    private devices = [];

    constructor(_popoverCtrl: PopoverController, 
                _deviceManagerService: DeviceManagerService,
                _toastCtrl: ToastController,
                _storage: StorageService,
                _navCtrl: NavController,
                _modalCtrl: ModalController) 
    {
        this.popoverCtrl = _popoverCtrl;
        this.toastCtrl = _toastCtrl;
        this.navCtrl = _navCtrl;
        this.modalCtrl = _modalCtrl;
        this.addDeviceIp = "http://"
        this.deviceManagerService = _deviceManagerService;
        this.storage = _storage;
        this.storage.getData('savedDevices').then((data) => {
            if (data !== null) {
                this.devices = JSON.parse(data);
            }
        });
    }

    ngOnDestroy() {
        this.storage.saveData('savedDevices', JSON.stringify(this.devices));
    }

    openPopover(event, arrayIndex: number) {
        let genPopover = this.popoverCtrl.create(GenPopover, {
                dataArray: ['connect', 'remove', 'configure']
            });
        genPopover.present({
            ev: event
        });
        genPopover.onDidDismiss(data=> {
            if (data.option === 'remove') {
                this.devices.splice(arrayIndex, 1);
            }
            else if (data.option === 'connect') {
                this.connectToDevice(arrayIndex);
            }
            else if (data.option === 'configure') {
                this.openConfigureModal();
            }
        });
    }

    openConfigureModal() {
        let modal = this.modalCtrl.create(DeviceConfigureModal, {
            message: 'hey'
        });
        modal.onDidDismiss((data) => {
            console.log(data);
        });
        modal.present();
    }

    toggleAddDevMenu() {
        this.showDevMenu = !this.showDevMenu;
    }

    checkIfMatching(ipAddress: string) {
        for (let i = 0; i < this.devices.length; i++) {
            if (this.devices[i].ipAddress === ipAddress) {
                return true;
            }
        }
    }

    attemptConnect(ipAddress: string) {
        if (this.checkIfMatching(ipAddress)) {
            let toast = this.toastCtrl.create({
                message: 'Device is Added Already',
                showCloseButton: true,
                position: 'bottom'
            });
            toast.present();
            return;
        }
        this.connectingToDevice = true;
        this.deviceManagerService.connect(ipAddress).subscribe(
            (success) => {
                this.connectingToDevice = false;
                this.devices.unshift(
                    {
                        deviceDescriptor: success.device[0],
                        ipAddress: ipAddress
                    }
                );
                this.storage.saveData('savedDevices', JSON.stringify(this.devices));
                this.showDevMenu = false;
                let toast = this.toastCtrl.create({
                    message: 'Device Added Successfully',
                    duration: 5000,
                    position: 'bottom'
                });
                toast.present();
            },
            (err) => {
                this.connectingToDevice = false;
                console.log(err);
                let toast = this.toastCtrl.create({
                    message: 'Error: No Response Received',
                    showCloseButton: true,
                    position: 'bottom'
                });
                toast.present();
            },
            () => {}
        );
    }

    connectToDevice(deviceIndex: number) {
        let ipAddress = this.devices[deviceIndex].ipAddress;
        this.deviceManagerService.connect(ipAddress).subscribe(
            (success) => {
                this.deviceManagerService.addDeviceFromDescriptor(ipAddress, success);
                /*Navigate to the parents of the tab controller so they have the nav type.
                Without navigating to the parents, the navCtrl is a 'Tab' and thus the 
                new root page will have the tab bar.*/
                this.navCtrl.parent.parent.setRoot(TestChartCtrlsPage);
            },
            (err) => {
                console.log(err);
                let toast = this.toastCtrl.create({
                    message: 'Error: No Response Received',
                    showCloseButton: true,
                    position: 'bottom'
                });
                toast.present();
            },
            () => {}
        );
    }
}