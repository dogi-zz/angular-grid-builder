import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {GridBuilderPanelCellComponent, GridBuilderPanelColumnsComponent, GridBuilderPanelComponent, GridBuilderPanelItemComponent, GridBuilderPanelRowsComponent} from './grid-builder-panel.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    GridBuilderPanelItemComponent,
    GridBuilderPanelCellComponent,
    GridBuilderPanelRowsComponent,
    GridBuilderPanelColumnsComponent,

    GridBuilderPanelComponent,
  ],
  exports: [GridBuilderPanelComponent],
})
export class GridBuilderModule {
}
