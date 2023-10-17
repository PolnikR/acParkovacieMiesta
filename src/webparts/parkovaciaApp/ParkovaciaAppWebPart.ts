import * as React from 'react';
import * as ReactDom from 'react-dom';
import { /*FormDisplayMode,*/ Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

//import * as strings from 'ParkovaciaAppWebPartStrings';
import ParkovaciaApp from './components/ParkovaciaApp';
import { IParkovaciaAppProps } from './components/ParkovaciaApp';

import '@pnp/sp'
import { SPFI, SPFx, spfi } from '@pnp/sp';
import { LogLevel, PnPLogging } from '@pnp/logging'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/batching'
import { GraphFI, graphfi, SPFx as graphSPFx } from '@pnp/graph';

export interface IParkovaciaAppWebPartProps {
  description: string;
}

export default class ParkovaciaAppWebPart extends BaseClientSideWebPart<IParkovaciaAppWebPartProps> {

  
  private _sp:SPFI;
  private _graph: GraphFI = null;
  private _allItems: any[]
  private _item:Record<string, any>;

  protected async onInit(): Promise<void> {
    this._sp = spfi().using(SPFx(this.context)).using(PnPLogging(LogLevel.Warning))
    this._graph = graphfi().using(graphSPFx(this.context)).using(PnPLogging(LogLevel.Warning))
    //this._allItems = await this._sp.web.lists.getById("8ff719fb-44f0-4a49-9084-afd59bed3b09").items.select("Title").top(4000).getAll();
    this._item = await this._sp.web.lists.getById("8ff719fb-44f0-4a49-9084-afd59bed3b09").items.getById(1)();

    let user = await this._sp.web.currentUser();
    console.log(user.Email, user.LoginName)
    return Promise.resolve() 
  }

  public render(): void {
    const parkovaciaApp: React.ReactElement<{}> = 
    React.createElement(ParkovaciaApp, {
        context: this.context,
        sp: this._sp,
        allItems: this._allItems,
        item: this._item,
        graph:this._graph
        
        
      } as IParkovaciaAppProps)
  

    ReactDom.render(parkovaciaApp, this.domElement);
  }

  

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "strings.PropertyPaneDescription"
          },
          groups: [
            {
              groupName: "strings.BasicGroupName,",
              groupFields: [
                PropertyPaneTextField('description', {
                  label: "strings.DescriptionFieldLabel"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}


