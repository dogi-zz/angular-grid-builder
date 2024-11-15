import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {GridBuilderDefinition, PanelBuilderButton, PanelBuilderDefinitionCell, PanelBuilderDefinitionColumns, PanelBuilderDefinitionItem, PanelBuilderDefinitionRows, PanelBuilderWidgetType} from "./grid-builder.definition";


@Component({
  selector: 'grid-builder-panel',
  template: `
    <div class="grid-builder-panel" *ngIf="_definition && widgetTypes">
      <grid-builder-panel-item [definition]="_definition" [editMode]="editMode" [isRoot]="true"></grid-builder-panel-item>
    </div>
  `,
})
export class GridBuilderPanelComponent implements OnInit, OnChanges, AfterViewInit {

  // @ViewChild('slider')
  // public slider: ElementRef<HTMLElement>;

  @Input()
  public editMode = false;

  @Input()
  public definition: GridBuilderDefinition;

  @Input()
  public _definition: GridBuilderDefinition;

  @Input()
  public data: any;


  @Output()
  public definitionChange = new EventEmitter<GridBuilderDefinition>();

  @Input()
  public resolveButtonContent: (button: PanelBuilderButton) => string;


  @Input()
  public widgetTypes: { [type: string]: PanelBuilderWidgetType };

  @Input()
  public rowStyles: { icon: string, style: string }[] = [];

  @Input()
  public columnStyles: { icon: string, style: string }[] = [];

  public widgetTypeEntries: (PanelBuilderWidgetType & { type: string }) [];

  public buttonAdd: string;
  public buttonDelete: string;

  public buttonAlignLeft: string;
  public buttonAlignRight: string;
  public buttonAlignCenter: string;

  public buttonAlignTop: string;
  public buttonAlignMiddle: string;
  public buttonAlignBottom: string;

  public buttonRows: string;
  public buttonColumns: string;

  public buttonRowsFullSize: string;
  public buttonColumnsFullSize: string;

  private isInitialised = false;
  private updateTimeout: any;

  public constructor() {
    console.info(this);
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit() {
    this.isInitialised = true;
    this.update();
    if (this.editMode) {
      setTimeout(() => this.updateButtons());
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.definition && JSON.stringify(changes.definition.currentValue) === JSON.stringify(this._definition)) {
      delete changes.definition;
    }
    if (!Object.keys(changes).length) {
      return;
    }
    this.update();
  }


  private update() {
    clearTimeout(this.updateTimeout);
    if (!this.isInitialised || !this.widgetTypes) {
      return;
    }
    this.updateTimeout = setTimeout(() => {
      this._definition = JSON.parse(JSON.stringify(this.definition));
      this.widgetTypeEntries = Object.entries(this.widgetTypes).map(([type, widgetType]) => ({...widgetType, type}));
    });
  }

  private updateButtons() {
    if (!this.isInitialised) {
      return;
    }
    this.resolveButtonContent = this.resolveButtonContent || (button => button);

    this.buttonAdd = this.resolveButtonContent('add');
    this.buttonDelete = this.resolveButtonContent('delete');

    this.buttonAlignLeft = this.resolveButtonContent('align-left');
    this.buttonAlignRight = this.resolveButtonContent('align-right');
    this.buttonAlignCenter = this.resolveButtonContent('align-center');

    this.buttonAlignTop = this.resolveButtonContent('align-top');
    this.buttonAlignMiddle = this.resolveButtonContent('align-middle');
    this.buttonAlignBottom = this.resolveButtonContent('align-bottom');

    this.buttonRows = this.resolveButtonContent('rows');
    this.buttonColumns = this.resolveButtonContent('columns');

    this.buttonRowsFullSize = this.resolveButtonContent('rows-full');
    this.buttonColumnsFullSize = this.resolveButtonContent('columns-full');
  }

  public send() {
    this.definitionChange.emit(JSON.parse(JSON.stringify(this._definition)));
  }

}


@Component({
  selector: 'grid-builder-panel-item',
  template: `
    <grid-builder-panel-cell *ngIf="definition.type === 'cell'" [definition]="definition" [editMode]="editMode" (onDelete)="onDelete.emit()"></grid-builder-panel-cell>
    <grid-builder-panel-rows *ngIf="definition.type === 'rows'" [definition]="definition" [editMode]="editMode" (onDelete)="onDelete.emit()" [isRoot]="isRoot"></grid-builder-panel-rows>
    <grid-builder-panel-columns *ngIf="definition.type === 'columns'" [definition]="definition" [editMode]="editMode" (onDelete)="onDelete.emit()"></grid-builder-panel-columns>

    <div class="grid-builder-edit-panel" *ngIf="editMode && !definition.type">
      <div class="grid-builder-button primary"
           (click)="setRows()" [innerHTML]="root.buttonRows"></div>
      <div class="grid-builder-button primary"
           (click)="setColumns()" [innerHTML]="root.buttonColumns"></div>

      <div class="grid-builder-button secondary"
           *ngFor="let widgetType of root.widgetTypeEntries"
           (click)="setCell(widgetType)" [innerHTML]="widgetType.icon"></div>

      <div class="grid-builder-button delete"
           (click)="onDelete.emit()" [innerHTML]="root.buttonDelete"></div>
    </div>
  `,
})
export class GridBuilderPanelItemComponent {

  @Input()
  public editMode = false;

  @Input()
  public definition: PanelBuilderDefinitionItem;

  @Output()
  public onDelete = new EventEmitter<void>();

  @Input()
  public isRoot: boolean;

  public constructor(
    public root: GridBuilderPanelComponent,
  ) {
  }

  public setRows() {
    this.definition.type = 'rows';
    (this.definition as PanelBuilderDefinitionRows).rows = [];
    this.root.send();
  }

  public setColumns() {
    this.definition.type = 'columns';
    (this.definition as PanelBuilderDefinitionColumns).columns = [];
    this.root.send();
  }

  public setCell(widgetType: PanelBuilderWidgetType & { type: string }) {
    this.definition.type = 'cell';
    (this.definition as PanelBuilderDefinitionCell).cellType = widgetType.type;
    (this.definition as PanelBuilderDefinitionCell).config = widgetType.createConfig();
    this.root.send();
  }
}


@Component({
  selector: 'grid-builder-panel-cell',
  template: `
    <div class="grid-builder-cell"
         *ngIf="root.widgetTypes?.[definition.cellType]" [class.edit]="editMode" [class.hover-marked]="hoverMark"
         [class.hover-delete]="hoverDelete">
      <div class="grid-builder-content">
        <ng-template *ngTemplateOutlet="root.widgetTypes[definition.cellType].template; context: {$implicit: {'foo': 13}, config: definition.config, edit: editMode, data: root.data, configChange: configChange }"></ng-template>
      </div>
      <div class="grid-builder-edit-panel" *ngIf="editMode">
        <div class="grid-builder-icon"
             [innerHTML]="root.widgetTypes[definition.cellType].icon" (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>
        <div class="grid-builder-buttons">
          <div class="grid-builder-button delete" (mouseenter)="hoverDelete = true" (mouseleave)="hoverDelete = false" [innerHTML]="root.buttonDelete" (click)="delete()"></div>
        </div>
      </div>
    </div>
  `,
})
export class GridBuilderPanelCellComponent {

  // @ViewChild('slider')
  // public slider: ElementRef<HTMLElement>;

  @Input()
  public editMode = false;

  @Input()
  public definition: PanelBuilderDefinitionCell;

  @Output()
  public onDelete = new EventEmitter<void>();

  public hoverDelete = false;
  public hoverMark = false;

  public constructor(
    public root: GridBuilderPanelComponent,
  ) {
  }

  public delete() {
    this.onDelete.emit();
    this.root.send();
  }

  public configChange = () => {
    this.root.send();
  };
}


@Component({
  selector: 'grid-builder-panel-rows',
  template: `
    <div class="grid-builder-rows"
         [class.edit]="editMode"
         [class.hover-delete]="hoverDelete" [class.hover-marked]="hoverMark"
         [ngClass]="definition.extraStyle ?('style-'+definition.extraStyle):null"
    >
      <div class="grid-builder-content"
           [class.align-left]="definition.align === 'left'"
           [class.align-right]="definition.align === 'right'"
           [class.align-center]="definition.align === 'center'"
           [class.full-size]="definition.fullSize"
      >
        <div *ngFor="let row of definition.rows; let i = index"
             class="grid-builder-rows-row"
             [class.edit]="editMode">
          <grid-builder-panel-item [definition]="row" [editMode]="editMode" (onDelete)="definition.rows.splice(i, 1)"></grid-builder-panel-item>
        </div>
      </div>

      <div class="grid-builder-edit-panel" *ngIf="editMode">
        <div class="grid-builder-icon"
             [innerHTML]="root.buttonRows" (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>


        <div class="grid-builder-buttons">
          <div class="grid-builder-button primary" (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false" [innerHTML]="root.buttonAdd" (click)="add()"></div>

          <div class="grid-builder-button"
               [class.primary]="definition.align === 'left'" [class.secondary]="definition.align !== 'left'" (click)="setAlign('left')" [innerHTML]="root.buttonAlignLeft"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>
          <div class="grid-builder-button"
               [class.primary]="definition.align === 'center'" [class.secondary]="definition.align !== 'center'" (click)="setAlign('center')" [innerHTML]="root.buttonAlignCenter"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>
          <div class="grid-builder-button"
               [class.primary]="definition.align === 'right'" [class.secondary]="definition.align !== 'right'" (click)="setAlign('right')" [innerHTML]="root.buttonAlignRight"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>

          <div class="grid-builder-button"
               [class.primary]="definition.fullSize" [class.secondary]="!definition.fullSize" (click)="toggleFullSize()" [innerHTML]="root.buttonRowsFullSize"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>

          <div class="grid-builder-button"
               *ngFor="let rowStyle of root.rowStyles"
               [class.primary]="definition.extraStyle === rowStyle.style" [class.secondary]="definition.extraStyle !== rowStyle.style" (click)="setRowsStyle(rowStyle.style)" [innerHTML]="rowStyle.icon"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>

          <div class="grid-builder-button delete" (mouseenter)="hoverDelete = true" (mouseleave)="hoverDelete = false" [innerHTML]="root.buttonDelete" (click)="delete()"></div>
        </div>
      </div>

    </div>

  `,
})
export class GridBuilderPanelRowsComponent {

  // @ViewChild('slider')
  // public slider: ElementRef<HTMLElement>;

  @Input()
  public editMode = false;

  @Input()
  public definition: PanelBuilderDefinitionRows;

  @Input()
  public isRoot: boolean;

  @Output()
  public onDelete = new EventEmitter<void>();

  public hoverMark = false;
  public hoverDelete = false;

  public constructor(
    public root: GridBuilderPanelComponent,
  ) {
  }

  public delete() {
    this.onDelete.emit();
    this.root.send();
  }

  public setAlign(align: 'left' | 'center' | 'right') {
    this.definition.align = this.definition.align === align ? null : align;
    this.root.send();
  }

  public toggleFullSize() {
    this.definition.fullSize = (!this.definition.fullSize) || undefined;
    this.root.send();
  }

  public setRowsStyle(style: string) {
    this.definition.extraStyle = this.definition.extraStyle === style ? null : style;
    this.root.send();
  }

  public add() {
    this.definition.rows.push({} as any);
    this.root.send();
  }
}


@Component({
  selector: 'grid-builder-panel-columns',
  template: `
    <div class="grid-builder-columns"
         [class.edit]="editMode"
         [class.hover-delete]="hoverDelete" [class.hover-marked]="hoverMark"
         [ngClass]="definition.extraStyle ?('style-'+definition.extraStyle):null"
    >

      <div class="grid-builder-edit-panel" *ngIf="editMode">
        <div class="grid-builder-icon"
             [innerHTML]="root.buttonColumns" (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>

        <div class="grid-builder-buttons">
          <div class="grid-builder-button primary" (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false" [innerHTML]="root.buttonAdd" (click)="add()"></div>

          <div class="grid-builder-button"
               [class.primary]="definition.align === 'top'" [class.secondary]="definition.align !== 'top'" (click)="setAlign('top')" [innerHTML]="root.buttonAlignTop"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>
          <div class="grid-builder-button"
               [class.primary]="definition.align === 'middle'" [class.secondary]="definition.align !== 'middle'" (click)="setAlign('middle')" [innerHTML]="root.buttonAlignMiddle"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>
          <div class="grid-builder-button"
               [class.primary]="definition.align === 'bottom'" [class.secondary]="definition.align !== 'bottom'" (click)="setAlign('bottom')" [innerHTML]="root.buttonAlignBottom"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>
          <div class="grid-builder-button"
               [class.primary]="definition.fullSize" [class.secondary]="!definition.fullSize" (click)="toggleFullSize()" [innerHTML]="root.buttonColumnsFullSize"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>
          <div class="grid-builder-button"
               *ngFor="let columnStyle of root.columnStyles"
               [class.primary]="definition.extraStyle === columnStyle.style" [class.secondary]="definition.extraStyle !== columnStyle.style" (click)="setRowsStyle(columnStyle.style)" [innerHTML]="columnStyle.icon"
               (mouseenter)="hoverMark = true" (mouseleave)="hoverMark = false"></div>

          <div class="grid-builder-button delete" (mouseenter)="hoverDelete = true" (mouseleave)="hoverDelete = false" [innerHTML]="root.buttonDelete" (click)="delete()"></div>
        </div>
      </div>

      <div class="grid-builder-content"
           [class.align-top]="definition.align === 'top'"
           [class.align-middle]="definition.align === 'middle'"
           [class.align-bottom]="definition.align === 'bottom'"
           [class.full-size]="definition.fullSize"
      >
        <div *ngFor="let row of definition.columns; let i = index"
             class="grid-builder-columns-column"
             [class.edit]="editMode">
          <grid-builder-panel-item [definition]="row" [editMode]="editMode" (onDelete)="definition.columns.splice(i, 1)"></grid-builder-panel-item>
        </div>
      </div>

    </div>


  `,
})
export class GridBuilderPanelColumnsComponent {

  // @ViewChild('slider')
  // public slider: ElementRef<HTMLElement>;

  @Input()
  public editMode = false;

  @Input()
  public definition: PanelBuilderDefinitionColumns;

  @Output()
  public onDelete = new EventEmitter<void>();

  public hoverMark = false;
  public hoverDelete = false;

  public constructor(
    public root: GridBuilderPanelComponent,
  ) {
  }

  public delete() {
    this.onDelete.emit();
    this.root.send();
  }

  public setAlign(align: 'top' | 'middle' | 'bottom') {
    this.definition.align = this.definition.align === align ? null : align;
    this.root.send();
  }

  public toggleFullSize() {
    this.definition.fullSize = (!this.definition.fullSize) || undefined;
    this.root.send();
  }

  public setRowsStyle(style: string) {
    this.definition.extraStyle = this.definition.extraStyle === style ? null : style;
    this.root.send();
  }

  public add() {
    this.definition.columns.push({} as any);
    this.root.send();
  }
}

