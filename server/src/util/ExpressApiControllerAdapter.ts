import * as express from "express"

import { Logger } from "./Logger"

export class ExpressApiControllerAdapter<PARAMS, BODY, QUERY,R> {
    
    public readonly logger = new Logger (ExpressApiControllerAdapter.name)
    
    constructor (public readonly controller : (request : express.Request<PARAMS, R, BODY, QUERY>) => Promise<R>) {

    }

    public readonly build = () => async (request : express.Request<PARAMS, R, BODY, QUERY>, response : express.Response<R>) => {
        const log = this.createLogFromRequet (request);

        try {
            const controllerResponse = await this.controller (request);

            log['response:body'] = controllerResponse
            
            response.status(200).json(controllerResponse);
            
            this.logger.trace ("Inbound http request", log)
        }
        catch (error) {
            response.sendStatus (500)
            this.logger.error ("Error executing http request", log, error)
        }
    }
    
    private readonly createLogFromRequet = (request : express.Request<any, any, any, any>) => {

        const log : Record<string, any> = {}

        log["request:url"] = request.url
        log["request:path"] = request.path
        log["request:params"] = request.params
        log["request:body"] = request.body

        for (const header in request.headers) {
            log [`request:header:${header}`] = request.headers[header]
        }

        return log;
    }

}

/*
import * as express from "express"

import { Logger } from "../Logger";
import { ExpressControllerExecutor } from "./ExpressControllerExecutor";

export class ExpressControllerAdapter<T, R> {
    public readonly logger = new Logger (ExpressControllerAdapter.name)

    public readonly log : any = {
        path : this.path
    }

    constructor (public readonly controller : (request : T) => Promise<R>) {

    }

    public register = (app : express.Express) => app.put (this.path, this.handleExpressRequest)

    private readonly handleExpressRequest = async (httpRequest : express.Request, httpResponse : express.Response) => {
        try {
            await new ExpressControllerExecutor (this, httpRequest, httpResponse).execute ()
        }
        catch (error) {
            this.logger.error ("Error executing http request", {error})
            httpResponse.sendStatus (500)
        }
    }
}
*/