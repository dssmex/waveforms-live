/******************************************************************************
* Drop-Down Menu - Digilent Ionic2 Components
* 
* Source: https://github.com/Digilent/ionic2-components
* Copyright (c) 2016, Digilent <www.digilent.com> 
****************************************************************************/

import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
    templateUrl: 'build/libs/digilent-ionic2-utilities/drop-down-menu/drop-down-menu.html',
    selector: 'drop-down-menu',
    directives: [NgClass]
})

export class DropDownMenu {

    private showEnabled: boolean = false;
    private selectedIndex: number = 0;
    public selectedValue: string = '';
    private bodyEventFired: boolean = false;

    private boundCloseListener = this.closeListener.bind(this);

    @Input() itemNames: Array<string> = [];
    @Output() valueChange = new EventEmitter();

    constructor() {
        //console.log('DropDownMenu Constructor');
        this.selectedValue = this.itemNames[0];        
    }
    
    //Toggle drop down items visible
    toggleShow(event) {
        if (event !== null && !this.showEnabled && !this.bodyEventFired) {
            this.showEnabled = true;
        }
        else if (event !== null && !this.showEnabled && this.bodyEventFired) {
            this.bodyEventFired = false;
        }
        else if (event === null) {
            this.showEnabled = false;
            this.bodyEventFired = true;
            setTimeout(() => {
                this.bodyEventFired = false;
            }, 10);
        }
        
        //If menu is now open, listen for mouse click
        if (this.showEnabled) {     
            //Add listener to document body to close drop down if user clicks outside the drop down
            document.body.addEventListener('click', this.boundCloseListener, true);
        } 
        else if (!this.showEnabled && event === null) {
            this.removeCloseListener();     
        }
    }

    //Remove the callback that fires when the drop down is closed
    removeCloseListener(){
        document.body.removeEventListener('click', this.boundCloseListener, true);
    }

    //Callback called when user clicks outside of open drop down
    closeListener(event) {
        this.toggleShow(null);
    }   

    //Callback called when user selects an item from the drop down
    onItemSelected(itemIndex: number) {
        this.selectedIndex = itemIndex;
        this.selectedValue = this.itemNames[itemIndex];
        this.showEnabled = false;
        this.valueChange.emit({ value: this.selectedValue });
    }
} 