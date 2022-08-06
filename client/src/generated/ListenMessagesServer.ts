import * as rx from "rxjs"
import {Request} from "express"

import { ListenMessagesResponse } from "./ListenMessagesResponse"

export type ListenMessagesExpressReuest = Request

export interface ListenMessagesServer {
    listenMessages : (request : ListenMessagesExpressReuest) => rx.Observable<ListenMessagesResponse>
}