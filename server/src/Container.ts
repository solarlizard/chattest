import { MESSAGE_DAO } from "./dao/message/MessageDao";
import { MONGO_CONNECTION } from "./dao/MongoConnection";
import { SEQ_DAO } from "./dao/SeqDao";
import { HttpServer } from "./HttpServer";
import { Logger } from "./util/Logger";

export class Container {

    private readonly logger = new Logger (Container.name);

    private readonly httpServer = new HttpServer ()

    public readonly start = async () => {
        await this.httpServer.start ()
        await MONGO_CONNECTION.start ()
        await SEQ_DAO.start ()
        await MESSAGE_DAO.start ()

        this.logger.info ("Started")
    }

    public readonly stop = async () => {
        await this.httpServer.stop ()
        await MONGO_CONNECTION.stop ()

        this.logger.info ("Stopped")
    }
}