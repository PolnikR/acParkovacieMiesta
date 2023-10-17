import { GraphFI } from "@pnp/graph"
import { SPFI } from "@pnp/sp"
import { ISiteUserInfo, ISiteUserProps, IWebEnsureUserResult } from "@pnp/sp/site-users/types"
// import { ISiteGroupInfo } from '@pnp/sp/site-groups/types'
import { User/*, Group*/ } from '@microsoft/microsoft-graph-types'
import { LocaleStrings } from "../ParkovaciaApp"

import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups/web'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/fields'
import '@pnp/graph/groups'
import "@pnp/graph/members";
import "@pnp/sp/folders/list";
import { IListItemFormUpdateValue } from "@pnp/sp/lists"
import { IPersonaProps } from "@fluentui/react"

export function Contains<A,V>(arr: A[], val: V, getVal: (x: A) => V = (x: A) => {return x as unknown as V}): boolean {
  for (const arrItem of arr){
    if (getVal(arrItem) === val) {return true}
  }
  return false
}

export function GetColProps(colName: string, cols: IColProps[]): IColProps {
  let result: IColProps = null
  cols.forEach(col => {
    if (col.InternalName === colName) {
      result = col
    }
  })
  return result
}

export async function GetGroupUsersGraph(spGroupId: number, sp: SPFI, graph: GraphFI): Promise<ISiteUserProps[]> {
  const spUsers: ISiteUserProps[] = []
  const userPrincipalNames: Set<string> = new Set()

  const spGroupMembers: ISiteUserInfo[] = await sp.web.siteGroups.getById(spGroupId).users()

  for (let index = 0; index < spGroupMembers.length; index++) {
    const loginName = spGroupMembers[index].LoginName.split('|')
    if (loginName.length !== 3) {continue}
    if (loginName[1] === 'membership') {
      userPrincipalNames.add(spGroupMembers[index].UserPrincipalName)
    }
    if (loginName[1] === 'tenant' || loginName[1] === 'federateddirectoryclaimprovider') {
      await graph.groups.getById(loginName[2]).members()
        .then((data) => {
          const users: User[] = data
          users.forEach((user) => {
            userPrincipalNames.add(user.userPrincipalName)
          })
        }).catch((err) => {
          console.error(err)
        })
    }
  }
  const names = Array.from(userPrincipalNames)
  
  for (let index = 0; index < names.length; index++) {
    await sp.web.ensureUser(names[index]).then((result: IWebEnsureUserResult) => {
      spUsers.push(result.data)
    }).catch((err) => {
      console.error(`${LocaleStrings.Helper.UserNotFound}: ${names[index]}`)
    })
  }

  return spUsers
}

export async function CheckGroupMembership(groupId: number, sp: SPFI): Promise<boolean> {
  let result = false
  await sp.web.currentUser.groups.getById(groupId)().then((found) => {
    result = true
  }).catch(() => {
    result = false
  })

  return result
}

export async function GetAllChoiceUsers(sp: SPFI): Promise<IChoice[]> {
  return sp.web.siteUsers.select('*')().then((users) => {
    return users.filter((user) => {
      const claim = user.LoginName.split('|')
      return claim.length > 2 && claim[1] === 'membership'
    }).map((member) => {
      return {value: `${member.Id}`, label: member.Title}
    })
  })
}

export async function GetAllChoiceMembers(sp: SPFI, graph: GraphFI): Promise<IPersonaProps[]> {
  let ChoiceUsers: IPersonaProps[] = []
  let ChoiceGroups: IPersonaProps[] = []
  const userClaims = ['membership', 'rolemanager', 'true', 'tenant']

  const allGroups = []
  let groups = await graph.groups.top(999).paged()

  allGroups.push(...groups.value)

  while(groups.hasNext) {
    groups = await groups.next()
    allGroups.push(...groups.value)
  }

  allGroups.filter((grp) => {
    return grp.visibility !== "Private" && grp.securityEnabled
  }).forEach((item) => {
    sp.web.ensureUser(`c:0t.c|tenant|${item.id}`).catch((err) => {console.log(err)})
  })

  await sp.web.siteUsers.select('*')().then((users) => {
    ChoiceUsers = users.filter((user) => {
      const claim = user.LoginName.split('|')
      return claim.length >= 2 && Contains(userClaims, claim[1])
    }).map((member) => {
      return {id: `${member.Id}`, text: member.Title, secondaryText:member.LoginName, tertiaryText:member.Email}
    })
  }).catch((error) => {
    console.error(error)
  })
  
  await sp.web.siteGroups.select('*')().then((groups) => {
    ChoiceGroups = groups.filter((group) => {
      return group.OwnerTitle !== 'Systémové konto'
    }).map((member) => {
      return {id: `${member.Id}`, text: member.Title}
    })
  }).catch((error) => {
    console.error(error)
  })

  return ChoiceUsers.concat(ChoiceGroups)
}

export async function GetGroupChoiceUsers(groupId: number, sp: SPFI): Promise<IChoice[]> {
  return sp.web.siteGroups.getById(groupId).users.select('*')().then((users) => {
    return users.filter((user) => {
      const claim = user.LoginName.split('|')
      return claim.length > 2 && claim[1] === 'membership'
    }).map((member) => {
      return {value: `${member.Id}`, label: member.Title}
    })
  })
}

export async function EnsureFolder(listId: string, folderName: string, sp: SPFI): Promise<void> {
  let exists: boolean = false
  await sp.web.lists.getById(listId).rootFolder.folders.getByUrl(folderName)()
  .then((folder) => {exists = true})
  .catch((error) => {
    console.error(error)
  })

  if (!exists){
    sp.web.lists.getById(listId).rootFolder.addSubFolderUsingPath(folderName)
    .catch((error) => {
      console.error(error)
    })
  }
}

export async function ValidateUpdateMemberMultiField(memberMultiFields: {fieldName: string, fieldValue: number[]}[], sp: SPFI): Promise<IListItemFormUpdateValue[]> {
  const validateUpdateItem: IListItemFormUpdateValue[] = []

  let Users: {id: number, loginName: string}[] = []
  let Groups: {id: number, loginName: string}[] = []

  await sp.web.siteUsers.select('*')().then((users) => {
    Users = users.map((member) => {
      return {id: member.Id, loginName: member.LoginName}
    })
  }).catch((error) => {
    console.error(error)
  })
  
  await sp.web.siteGroups.select('*')().then((groups) => {
    Groups = groups.map((member) => {
      return {id: member.Id, loginName: member.LoginName}
    })
  }).catch((error) => {
    console.error(error)
  })

  const Members: {id: number, loginName: string}[] = Users.concat(Groups)
  const getMember = (id: number): string => {
    for (let index = 0; index < Members.length; index++) {
      if (Members[index].id === id) {
        return Members[index].loginName
      }
    }
    return null
  }

  memberMultiFields.forEach((field) => {
    const loginNames: string[] = []
    field.fieldValue.forEach((id) => {
      const loginName = getMember(id)
      if (loginName) {
        loginNames.push(loginName)
      }
    })
    validateUpdateItem.push({FieldName: field.fieldName, FieldValue: JSON.stringify(loginNames.map((loginName) => {return {'Key': loginName}}))})
  })
  
  return validateUpdateItem
}
