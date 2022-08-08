
import * as rx from "rxjs"

type LOG_LEVEL = 'ERROR' | 'WARN' | 'INFO' | 'TRACE' | 'FATAL'

export class Logger {

    constructor (public readonly name : string) {

    }
    private readonly log = (level : LOG_LEVEL) => (message : string, params : unknown = {}, error? : any) => {
        console.log (`${level} : ${new Date ().toUTCString ()} : ${this.name} : ${message} : ${JSON.stringify (params)}` );
        
        if (error) {
            console.error (error)
        }
    }

    public readonly rx = {
        retry : (message  : string, params : any  = {}) : rx.RetryConfig => ({
            resetOnSuccess : true,
            delay : error => {
                this.error (message, params, error)

                return rx.timer (1000)
            }
        }),
        subscribe: (message : string, {
            params = {},
        } : {
            params ?: any,
        } = {
            params: {},
        }) => {
            return {
                next: () => {},
                complete: () => {},
                error: (error : any) => {
                    this.fatal (message, params, error)
                },
            }
        },
    }    

    public readonly fatal = this.log ('FATAL')
    public readonly error = this.log ('ERROR')
    public readonly warn = this.log ('WARN')
    public readonly info = this.log ('INFO')
    public readonly trace = this.log ('TRACE')

    public readonly retryPromise = async <T> (promise : () => Promise<T>, message : string) => {
        while (true) {
            try {
                const result = await promise ()

                return result;
            }
            catch (error) {
                this.error (message, {}, error)
            }
        }
    }
}

