import {Directive, EventEmitter, Input, Output, TemplateRef} from "@angular/core";

export type PanelBuilderButton =
  'add' | 'delete' |
  'rows' | 'columns' | 'cell' |
  'columns-full' | 'rows-full' |
  'align-left' | 'align-right' | 'align-center' |
  'align-top' | 'align-middle' | 'align-bottom';



export type PanelBuilderWidgetType = {
  icon: string,
  createConfig: () => any,
  template: TemplateRef<any>,
};

@Directive({})
export abstract class PanelBuilderWidgetBase<C> {

  @Input()
  public edit: boolean;

  @Input()
  public config: C;

  @Input()
  public data: any;

  @Output()
  public configChange = new EventEmitter<C>();
}


export interface PanelBuilderDefinitionCell {
  type: 'cell';
  cellType: string;
  config: any;
}


export type PanelBuilderDefinitionItem = PanelBuilderDefinitionRows | PanelBuilderDefinitionCell | PanelBuilderDefinitionColumns;


export interface PanelBuilderDefinitionRows {
  type: 'rows';
  align?: 'left' | 'center' | 'right';
  fullSize?: boolean;
  extraStyle?: string;
  rows: PanelBuilderDefinitionItem[],
}


export interface PanelBuilderDefinitionColumns {
  type: 'columns';
  align?: 'top' | 'middle' | 'bottom';
  fullSize?: boolean;
  extraStyle?: string;
  columns: PanelBuilderDefinitionItem[],
}

export interface GridBuilderDefinition extends PanelBuilderDefinitionRows {

}
