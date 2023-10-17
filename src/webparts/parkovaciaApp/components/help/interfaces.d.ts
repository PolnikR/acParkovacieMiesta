declare interface IColProps {
    Title: string
    InternalName: string
    TypeAsString: string
    TypeDisplayName: string
    Required: boolean
    ReadOnlyField: boolean
    Choices?: string[]
    LookupField?: string
    LookupList?: string
    LookupWebId?: string
    MaximumValue?: number
    MinimumValue?: number
    ShowAsPercentage?: boolean
    CurrencyLocaleId?: number
    DisplayFormat?: number
    SelectionGroup?: number
    NumberOfLines?: number
  }
  
  declare interface IHandle<T> {
    value: T
    setValue: React.Dispatch<React.SetStateAction<T>>
  }

 
  
  declare interface FormUser {
    Id: number
    IsHiddenInUI: boolean
    LoginName: string
    Title: string
    PrincipalType: number
    Email: string
    Expiration: string
    IsEmailAuthenticationGuestUser: boolean
    IsShareByEmailGuestUser: boolean
    IsSiteAdmin: boolean
    UserId: {
        NameId: string
        NameIdIssuer: string
    },
    UserPrincipalName: string
  }
  
  declare interface FormGroup {
    AllowMembersEditMembership: boolean
    AllowRequestToJoinLeave: boolean
    AutoAcceptRequestToJoinLeave: boolean
    Description: string
    Id: number
    IsHiddenInUI: boolean
    LoginName: string
    OnlyAllowMembersViewMembership: boolean
    OwnerTitle: string
    PrincipalType: number
    RequestToJoinLeaveEmailSetting: string
    Title: string
  }
  
  interface IChoice {
    value: string
    label: string
  }
  