import { MongoClient, MongoServerError } from "mongodb"
import { CONFIG } from "../Config"
import { Logger } from "../util/Logger"

export class MongoConnection {
    private readonly logger = new Logger (MongoConnection.name)

    private readonly client = new MongoClient (CONFIG.dbUrl, {
        retryWrites : false,
        maxPoolSize : 200,
        keepAlive : true,
        serverSelectionTimeoutMS : 10000
    })
    
    public readonly db = this.client.db (CONFIG.dbName)

    public readonly start = async () => {

        this.client.on ('connectionReady', () => this.logger.info ("Connected to mongo"))

        await this.logger.retryPromise (() => this.client.connect (), "Error connecting to mongo");
    }

    public readonly stop = async () => this.client.close ()

}

export const MONGO_CONNECTION = new MongoConnection ()