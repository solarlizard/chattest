import * as express from "express"
import * as http from "http"

import {Server, Socket} from "socket.io"

import { DeleteMessageResponse } from "./DeleteMessageResponse";
import { DeleteMessageExpressRequest } from "./DeleteMessageServer";
import { PostMessageResponse } from "./PostMessageResponse";
import { PostMessageExpressRequest } from "./PostMessageServer";
import { ListMessagesExpressRequest } from "./ListMessagesServer";
import { ListMessagesResponse } from "./ListMessagesResponse";

export const attachToExpress = (router : express.Router, httpServer : http.Server , server : {
    postMessage : (req : PostMessageExpressRequest, res : express.Response<PostMessageResponse>) => void, 
    deleteMessage : (req : DeleteMessageExpressRequest, res : express.Response<DeleteMessageResponse>) => void,
    listMessages : (req : ListMessagesExpressRequest, res : express.Response<ListMessagesResponse>) => void,
    listenMessages : (socket : Socket) => void
}) => {
    
    router.post("/api/messages/:id", server.postMessage)
    router.delete("/api/messages/:id", server.deleteMessage)
    router.get("/api/messages/", server.listMessages)

    new Server(httpServer, {
        path : "/api/messages/connect"
    })
    .on('connection', server.listenMessages);

    
}