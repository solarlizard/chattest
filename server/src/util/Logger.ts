type LOG_LEVEL = 'ERROR' | 'WARN' | 'INFO' | 'TRACE'

export class Logger {

    constructor (public readonly name : string) {

    }
    private readonly log = (level : LOG_LEVEL) => (message : string, params : unknown = {}, error? : any) => {
        console.log (`${level} : ${new Date ().toUTCString ()} : ${this.name} : ${message} : ${JSON.stringify (params)}` );
        
        if (error) {
            console.error (error)
        }
    }

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

