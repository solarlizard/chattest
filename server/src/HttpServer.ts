import * as http from "http"
import * as express from "express"
import { Logger } from "./util/Logger";
import { startHttpServer } from "./util/startHttpServer";
import { CONFIG } from "./Config";
import { stopHttpServer } from "./util/stopHttpServer";
import { attachToExpress } from "./generated/attachToExpress";
import { ExpressApiControllerAdapter } from "./util/ExpressApiControllerAdapter";
import { PostMessageController } from "./controller/PostMessageController";
import { DeleteMessageController } from "./controller/DeleteMessageController";
import {Server, Socket} from "socket.io"
import { ExpressApiSocketAdapter } from "./util/ExpressApiSocketAdapter";
import { ListenMessagesController } from "./controller/ListenMessagesController";
import { ListMessagesController } from "./controller/ListMessagesController";

export class HttpServer {

    private readonly logger = new Logger (HttpServer.name);

    private readonly app = express ();
    private readonly httpServer = http.createServer (this.app);

    constructor () {


        const router = express.Router();
        
        this.app.use(express.json());

        attachToExpress (router, this.httpServer, {
            deleteMessage : new ExpressApiControllerAdapter (new DeleteMessageController ().deleteMessage).build (),
            postMessage : new ExpressApiControllerAdapter (new PostMessageController ().postMessage).build (),
            listMessages : new ExpressApiControllerAdapter (new ListMessagesController ().listMessaages).build (),
            listenMessages : new ExpressApiSocketAdapter (new ListenMessagesController ().listenMessages).build ()
        })

        this.app.use ('/', router)
    }


    public readonly start = async () => {
        await startHttpServer (this.httpServer, CONFIG.httPort)

        this.logger.info (`Started at http://127.0.0.1:${CONFIG.httPort}`)
    }

    public readonly stop = () => stopHttpServer (this.httpServer);
}