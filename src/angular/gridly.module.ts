import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridlyTableComponent } from './table.component';

@NgModule({
    declarations: [GridlyTableComponent],
    imports: [CommonModule],
    exports: [GridlyTableComponent]
})
export class GridlyModule { } 