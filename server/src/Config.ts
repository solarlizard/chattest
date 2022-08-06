import { Logger } from "./util/Logger";

class Config {

    private static readonly DB_URL = 'dbUrl';
    private static readonly DB_NAME = 'dbName';
    private static readonly HTTP_PORT = 'httpPort';

    private readonly logger = new Logger (Config.name)

    public readonly dbUrl = process.env[Config.DB_URL]!
    public readonly dbName = process.env[Config.DB_NAME]!
    public readonly httPort = parseInt (process.env[Config.HTTP_PORT]!)
    public readonly jsonEncoding = 'utf-8'

    constructor () {

        /* istanbul ignore if */
        if (!this.dbUrl) {
            /* istanbul ignore next */
            this.exitWithError (Config.DB_URL)
        }

        /* istanbul ignore if */
        if (!this.dbName) {
            /* istanbul ignore next */
            this.exitWithError (Config.DB_NAME)
        }

        /* istanbul ignore if */
        if (!this.httPort) {
            /* istanbul ignore next */
            this.exitWithError (Config.HTTP_PORT)
        }

        return this;
    }

    /* istanbul ignore next */
    private readonly exitWithError = (name : string) => {
        this.logger.error ("Invalid configuration", {error : `${name} is not defined`})
        process.exit (1)
    }
}

export const CONFIG = new Config ()
