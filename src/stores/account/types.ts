import type pronote from "pawnote";
import type { Account as PawdirecteAccount, Session as PawdirecteSession } from "pawdirecte";
import type { Session as TSSession, Authentication as TSAuthentication } from "turbawself";
import type { Client as ARDClient } from "pawrd";

export interface Tab {
  name: string
  enabled: boolean
}

export interface PersonalizationColor {
  id: string
  name: string
  description: string
  hex: {
    primary: string
    darker: string
    lighter: string
    dark: string
  }
}

export interface Personalization {
  color: PersonalizationColor
  profilePictureB64?: string,
  hideNameOnHomeScreen: boolean,
  hideProfilePicOnHomeScreen: boolean,
  hideTabTitles: boolean,
  showTabBackground: boolean,
  transparentTabBar: boolean,
  hideTabBar: boolean,
  tabs: Tab[],
  subjects: {
    [subject: string]: {
      color: string,
      pretty: string,
      emoji: string,
    }
  }
}

export interface CurrentAccountStore {
  /** Si un compte est en cours d'utilisation, on obtient l'ID, sinon `null`. */
  account: PrimaryAccount | null
  linkedAccounts: ExternalAccount[]
  mutateProperty: <T extends keyof PrimaryAccount>(key: T, value: PrimaryAccount[T]) => void
  linkExistingExternalAccount: (account: ExternalAccount) => void
  switchTo: (account: PrimaryAccount) => Promise<void>
  logout: () => void
}

export enum AccountService {
  Pronote,
  // For the future...
  EcoleDirecte,
  Skolengo,
  WebResto,
  Turboself,
  ARD,
  Parcoursup,
  Onisep
}

/**
 * All the properties defined
 * for EVERY accounts stored.
 */
interface BaseAccount {
  localID: string
  isExternal: false

  name: string
  className?: string
  schoolName?: string
  linkedExternalLocalIDs: string[]

  studentName: {
    first: string
    last: string
  },
  personalization: Partial<Personalization>
}

interface BaseExternalAccount {
  localID: string
  isExternal: true

  data: Record<string, unknown>
}

export interface PronoteAccount extends BaseAccount {
  service: AccountService.Pronote
  instance?: pronote.SessionHandle;

  authentication: pronote.RefreshInformation & {
    deviceUUID: string
  }
}

export interface EcoleDirecteAccount extends BaseAccount {
  service: AccountService.EcoleDirecte
  instance: undefined
  authentication: {
    session: PawdirecteSession
    account: PawdirecteAccount
  }
}

export interface TurboselfAccount extends BaseExternalAccount {
  service: AccountService.Turboself
  instance: undefined
  authentication: {
    auth: TSAuthentication
    session: TSSession
  }
}

export interface ARDAccount extends BaseExternalAccount {
  service: AccountService.ARD
  instance?: ARDClient
  authentication: {
    pid: string
    username: string
    password: string
    schoolID: string
  }
}

export type PrimaryAccount = (
  | PronoteAccount
  | EcoleDirecteAccount
);
export type ExternalAccount = (
  | TurboselfAccount
  | ARDAccount
);

export type Account = (
  | PrimaryAccount
  | ExternalAccount
);

export interface AccountsStore {
  lastOpenedAccountID: string | null
  accounts: Account[]
  create: (account: Account) => void
  remove: (localID: string) => void
  update: <A extends Account, T extends keyof A = keyof A>(localID: string, key: T, value: A[T]) => Account | null
}