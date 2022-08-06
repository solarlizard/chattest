import * as rx from "rxjs"
import * as ro from "rxjs/operators"
import * as express from "express"
import * as ws from 'ws'

import { Logger } from "./Logger"
import { Socket } from "socket.io"
import { IncomingMessage } from "http"

export class ExpressApiSocketAdapter<PARAMS, QUERY,R> {
    public readonly wsServer = new ws.Server ({ noServer: true })
    public readonly logger = new Logger (ExpressApiSocketAdapter.name)
    
    constructor (public readonly controller : (socket : Socket) => rx.Observable<R>) {

    }

    public readonly build = () => async (socket : Socket) => {
        const log = this.createLogFromRequet (socket.request);

        try {
            const obsservable = this.controller (socket);

            this.logger.trace ("Inbound socket connected", log)

            obsservable
                .pipe (
                    ro.tap (model => socket.emit ('data', model)),
                    ro.takeUntil (
                        rx.fromEventPattern (handler => socket.on ('disconnect', () => handler ()))
                    ),
                    ro.finalize (() => {
                        socket.disconnect (true)
                        this.logger.trace ("Inbound socket disconnected", log)
                    })
                )
                .subscribe ({
                    error : error => this.logger.error ("Error processing socket", log, error)
                })
            
        }
        catch (error) {
            socket.disconnect (true)
            this.logger.error ("Error executing inbound socket", log, error)
        }
    }
    
    private readonly createLogFromRequet = (request : IncomingMessage) => {

        const log : Record<string, any> = {}

        log["request:url"] = request.url

        for (const header in request.headers) {
            log [`request:header:${header}`] = request.headers[header]
        }

        return log;
    }

}
