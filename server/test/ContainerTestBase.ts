
const setEnv = () => {
    process.env['dbUrl'] = "mongodb://login:password@127.0.0.1:27017";
    process.env['dbName'] = "chat";
    process.env['httpPort'] = "8080";
}

setEnv ()

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { MongoClient } from 'mongodb';

import { CONFIG } from '../src/Config';
import { MESSAGE_DAO } from '../src/dao/message/MessageDao';
import { Logger } from '../src/util/Logger';

import {Container} from "./../src/Container";


export class ContainerTestBase {

    private readonly logger = new Logger (ContainerTestBase.name)
    protected readonly createClient = <T, R> (path : string) => (request : T, config ?: AxiosRequestConfig) => this.axios.put<T, AxiosResponse<R>> (`http://127.0.0.1:8080${path}`, request, config)

    protected readonly container = new Container ()

    protected readonly axios = axios.create ()

    private readonly client = new MongoClient (CONFIG.dbUrl, {
        retryWrites : false,
        maxPoolSize : 200,
        keepAlive : true,
        serverSelectionTimeoutMS : 10000
    })
    
    private readonly db = this.client.db (CONFIG.dbName)
    
    async before () {
        await this.logger.retryPromise (() => this.client.connect (), "Error connecting to mongo");
        await this.container.start ()
    }


    async after () {
        await this.container.stop ()
        await this.db.dropDatabase ()
        await this.client.close ()
    }
}
