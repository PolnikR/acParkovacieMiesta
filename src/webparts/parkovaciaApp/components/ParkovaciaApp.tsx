import * as React from 'react';
import { SPFI } from '@pnp/sp';
import "@pnp/sp/items/get-all";
import { ILang, getLangStrings } from '../loc/langHelper';
import TextFieldCard from './cards/textField';
import { Contains, GetAllChoiceMembers, GetColProps } from './help/helperFunctions';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { FormDisplayMode } from '@microsoft/sp-core-library';

import { DefaultButton } from '@fluentui/react/lib/Button';

import PeoplePickerCard from './cards/peoplePicker';
import { GraphFI } from '@pnp/graph';
import { IPersonaProps } from '@fluentui/react';




export const LocaleStrings: ILang = getLangStrings('sk')

export interface IParkovaciaAppProps{
  sp:SPFI;
  graph:GraphFI;
  allItems: any[]
  displaysMode:FormDisplayMode
  item:Record<string,any>
  context: WebPartContext
  onSave: (item: {}, etag?:string) => Promise<void>

  
}


const ParkovaciaApp: React.FC<IParkovaciaAppProps> =(props) => {

const [item, setItem] = React.useState<Record<string, any>>(props.item? props.item :{})
const [cols, setCols] = React.useState<IColProps[]>([])
   
const listId = "8ff719fb-44f0-4a49-9084-afd59bed3b09"

//#region On_Load

const [MembersChoices, SetMembersChoices] = React.useState<IPersonaProps[]>([])
React.useEffect(() => {


  props.sp.web.lists.getById(listId).fields.filter('Hidden eq false')()
      .then((fields) => {
        setCols(fields)
      })
      .catch(err => {
        //setShow(true)
        console.error(err)
      })

  GetAllChoiceMembers(props.sp, props.graph).then((choiceMembers) => {
    SetMembersChoices(choiceMembers)
  }).catch((error) => {
    console.error(error)
  })

}, [props])


const [TitleProps, TitlePropsSet] = React.useState<IColProps>()
const [nameProps, namePropsSet] = React.useState<IColProps>()
const [surNameProps, surNamePropsSet] = React.useState<IColProps>()
const [aprovedByProps, aprovedByPropsSet] = React.useState<IColProps>()

React.useEffect(()=> {
  TitlePropsSet(GetColProps('Title', cols))
  namePropsSet(GetColProps('field_1', cols))
  surNamePropsSet(GetColProps('field_2', cols))
  aprovedByPropsSet(GetColProps('acColPerson', cols))
}, [cols])

const StringValSet = (value: string, valueName: string): void => {
  setItem({
    ...item,
    [valueName]: value,
  })
}

/*const PersonValSet = (value: string, valueName: string): void => {
  setItem({
    ...item,
    [`${valueName}Id`]: value ? +value : null,
    [`${valueName}StringId`]: value ? value : '',
  })
}*/

/*const PersonValMultiset = (value: string[], valueName: string): void => {
  setItem({
    [`${valueName}Id`] : value.map((item) => (item ? + item  : null)),
    [`${valueName}StringId`]: value.map((item) => (item ? item : "")) 
  })
}*/

const PersonValSet = (value: IPersonaProps[], valueName: string): void => {
  const newValue = value.map((v) => (v.id ? +v.id : null)); // Map the array to numbers (or null)
  const newStringValue = value.map((v) => (v.id ? v.id : '')); // Map the array to strings (or empty strings)
  
  setItem({
    ...item,
    [`${valueName}Id`]: newValue,
    [`${valueName}StringId`]: newStringValue,
  });
};

const TitleHandle = {value:item['Title'], setValue: (value: string)=> StringValSet(value,'Title')}
const nameHandle = {value:item['field_1'], setValue: (value: string)=> StringValSet(value,'field_1')}
const surNameHandle = {value:item['field_2'], setValue: (value: string)=> StringValSet(value,'field_2')}
const aprovedByHandle = {value:item['acColPersonStringId'], setValue: (value: any[]) => PersonValSet(value, 'acColPerson') }
//const aprovedByHandle = {value: item['acColPersonStringId'], setValue: (value: any) => {return}}

const [aproversSelected, setAproversSelected] = React.useState<string[]>([])

React.useEffect(() => {
  const selected:string[] = []
  const selectedId: string[] = item['acColPersonStringId'] ? item['acColPersonStringId'] : []
  MembersChoices.forEach((member) => {
    if(Contains(selectedId, member.id)){
      selected.push(member.tertiaryText)
    }
  })
  setAproversSelected(selected)
}, [MembersChoices])



React.useEffect(()=>{
  console.log("handles")
  console.log(item)
  console.log(aprovedByHandle.value)
}, [aprovedByHandle.value])

    return (
      <section >
        <TextFieldCard id={'title'} title= {TitleProps? TitleProps.Title:""} itemHandle={TitleHandle} required={false }/>
        <TextFieldCard id={'name'} title={nameProps ? nameProps.Title:""} itemHandle={nameHandle} required={true}/>
        <TextFieldCard id={'surname'} title={surNameProps ? surNameProps.Title:""} itemHandle={surNameHandle} required={true}/>
        <PeoplePickerCard id={'approvedBy'} title={aprovedByProps? aprovedByProps.Title : ""} itemHandle={aprovedByHandle} selected={aproversSelected} context={props.context as any} displaMode={props.displaysMode} required={true}/>
        <DefaultButton text='Save' onClick={async () => {
          await props.sp.web.lists.getById(listId).items.getById(1).update({
            Title: TitleHandle.value,
            field_1: nameHandle.value,
            field_2: surNameHandle.value,
            acColPersonId: aprovedByHandle.value

          })
        }}/>
        
      </section>
    );
}
export default ParkovaciaApp
 