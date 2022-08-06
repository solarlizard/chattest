import { Logger } from "./Logger";

export const retryPromise = <R>(logger : Logger, fn : () => Promise<R>) => new Promise<R>(resolve => { 
    fn()
      .then(resolve)
      .catch(error => {

        logger.error ("Error in retry", {}, error)

        setTimeout(() => {          
            retryPromise(logger, fn)
            .then(resolve);
        }, 500);
      })
  });