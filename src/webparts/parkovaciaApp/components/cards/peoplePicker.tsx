//import { FormDisplayMode } from "@microsoft/sp-core-library";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import * as React from 'react'
import { WebPartContext } from '@microsoft/sp-webpart-base';
//import { IPersonaProps } from "@fluentui/react";
import { LocaleStrings } from '../ParkovaciaApp'
import { FormDisplayMode } from "@microsoft/sp-core-library";

interface IPeoplePickerCard{
  id: string
  title: string
  selected:any[]
  required: boolean
  itemHandle: IHandle<string[]>
  displaMode:FormDisplayMode
  context:WebPartContext
}

const PeoplePickerCard: React.FC<IPeoplePickerCard> = (({context, itemHandle, id , title, selected, required, displaMode}) =>{
    const [value, setValue] = React.useState<IChoice[]>(null)
    const [/*error*/, setError] = React.useState<boolean>(selected ? false : required)
    const [errorMessage, setErrorMessage] = React.useState<string>()


    const onChange = (items: any[]): void => {
        itemHandle.setValue(items)
        setValue(items.map((item)=>{
            let arr:IChoice={
                value: item.id,
                label: item.text
            }
            return arr
            
        }))
        
    }
    
    React.useEffect(()=>{
        const isErrorVal = itemHandle.value && itemHandle.value.length > 0 ? false : required
        setError(isErrorVal)
        setErrorMessage(isErrorVal ? `${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}`: null)
    }, [itemHandle.value, required])

    console.log(value)
    return (
        <>
            <PeoplePicker
                context={context as any}
                titleText={title}
                personSelectionLimit={10}
                ensureUser={true}
                groupName={""} // Leave this blank in case you want to filter from all users
                showtooltip={true}
                required={required}
                disabled={displaMode === FormDisplayMode.Display}
                onChange={onChange}
                defaultSelectedUsers={selected}
                //showHiddenInUI={false}
                principalTypes={[PrincipalType.User, PrincipalType.SecurityGroup, PrincipalType.SharePointGroup]}
                errorMessage={errorMessage}
                resolveDelay={1000} />
        </>
    )

})
export default PeoplePickerCard