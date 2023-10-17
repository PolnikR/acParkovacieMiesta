import * as React from "react";
import { TextField, ITextFieldStyles } from "@fluentui/react/lib/TextField";
import { Stack } from "@fluentui/react/lib/Stack";
//import { FormDisplayMode } from "@microsoft/sp-core-library";
import { LocaleStrings } from '../ParkovaciaApp'

interface ITextField{
    id:string
    title:string
    //displayMode: FormDisplayMode
    required: boolean
    itemHandle:IHandle<string>
    valueVerify?: (value: string) => string


}
const textFieldStyles: Partial<ITextFieldStyles> = {fieldGroup:{width:300}}
//const narrowTextFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: { width: 100 } };
const stackTokens = { childrenGap: 15 };

const TextFieldCard: React.FC<ITextField> = ({id,title, itemHandle, required, valueVerify = (value):string => {return null} }) => {
    //const [error, setError] = React.useState<boolean>(itemHandle.value ? false : required)
    //const [errorMesage, setErrorMessage] = React.useState<string>()

    const onChange = (event:React.ChangeEvent<HTMLInputElement>):void => {
        itemHandle.setValue(event.target.value)
        
        
    }
    
    console.log(LocaleStrings.Cards.PleaseFill)
    /*React.useEffect(() => {
        const verifyResult = valueVerify(itemHandle.value)
        const isErrorVal = itemHandle.value ? false : required || valueVerify ? true : false
        setErrorMessage(isErrorVal ? (
            !itemHandle.value && required 
            ? `${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}`
            : verifyResult) :null)
    }, [itemHandle.value, required])
    console.log(errorMesage)
    setErrorMessage("dsfsdf")
    /*setError(true)
    console.log(errorMesage)
    console.log(error)*/

    return(
        <>
            <Stack tokens={stackTokens}>
                <TextField
                    id={id}
                    label={title}
                    //disabled={displayMode === FormDisplayMode.Display}
                    //required={required}
                    //value={itemHandle.value}
                    onChange={onChange}
                    //errorMessage={errorMesage}
                    
                    
                    
                    styles = {textFieldStyles}
                />
            </Stack>
        </>
    )


}
export default TextFieldCard