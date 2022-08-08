import * as rx from "rxjs"
import * as ro from "rxjs/operators"

import React, { useEffect, useRef } from "react";

import { Logger } from "../../../../util/Logger";
import { nullToNothing } from "../../../../util/nullToNothing";
import { retryPromise } from "../../../../util/retryPromise";
import { trimToNull } from "../../../../util/trimToNull";
import { PostMessageApiModel, SERVER } from "../../Server";
import {v4} from "uuid"
import { faker } from '@faker-js/faker';

import styles from "./Input.module.css"
import { PostMessageResponse } from "../../../../generated/PostMessageResponse";

export const Input = () => {

    const logger = useRef (new Logger ("Input"))

    const contentInput = useRef<HTMLInputElement> (null)

    const [name, setName] = React.useState<string> (`${faker.name.firstName ()} ${faker.name.lastName ()}`)
    const [nameIsInvalid, setNameIsInvalid] = React.useState (false)

    const [content, setContent] = React.useState<string> ("")
    const [contentIsInvalid, setContentIsInvalid] = React.useState (false)

    const [busy, setBusy] = React.useState (false)

    const unmountedSubject = useRef(new rx.Subject<void> ())

    const clearInvalids = () => {
        setNameIsInvalid (false)
        setContentIsInvalid (false)
    }

    const handleNameChanged = (event : React.ChangeEvent<HTMLInputElement>) => {
        clearInvalids ()
        setName (event.target.value)
    }

    const handleContentChanged = (event : React.ChangeEvent<HTMLInputElement>) => {
        clearInvalids ()
        setContent (event.target.value) 
    }

    const hundleFormSubmit = (e : React.FormEvent) => {
        e.preventDefault ()

        const model = formToModel ()

        if (!model) {
            return
        }

        contentInput.current!.disabled = true
        setBusy (true)

        doPost (model)
        
        return false
    }

    const doPost = (model : PostMessageApiModel) => SERVER.executeWithRetry (() => SERVER.postMessage (model))
        .pipe (
            ro.map (handlePostResponse),
            ro.takeUntil (unmountedSubject.current)
        )
        .subscribe (logger.current.rx.subscribe ("Error positing message"))

    const handlePostResponse = (response : PostMessageResponse) => {
        if (response.type === 'emptyContent') {
            setContentIsInvalid (true)
        }
        
        setBusy (false)
        contentInput.current!.disabled = false
        contentInput.current!.focus ()

    }

    const formToModel = () : PostMessageApiModel | null =>  {

        const preparedName = trimToNull (name)

        if (preparedName == null) {
            setName (nullToNothing (preparedName))
            setNameIsInvalid (true)
            return null
        }        

        return {
            content : content,
            author : preparedName,
            id : v4 ().toString ()
        }
    }

    const getInvalidClassName = (condition : boolean) => {
        if (condition) {
            return "is-invalid"
        }
        else {
            return ""
        }
    }

    const handleSeed = async () => {
        for (let q = 0; q < 200; q++) {
            await SERVER.postMessage ({
                author : faker.name.firstName () + " " + faker.name.lastName (),
                id : v4 ().toString (),
                content : faker.hacker.phrase()
            })
        }
    }

    useEffect (() => {
        const subject = unmountedSubject.current;

        return () => {
            subject.next ()
        }
    }, [])

    return (
        <div className={styles.Input}>

            <form onSubmit={hundleFormSubmit}>
                <div className="input-group mb-3">
                    <input  disabled={busy} 
                            type={"text"} 
                            className={`form-control ${getInvalidClassName (nameIsInvalid)}`} 
                            placeholder="Name" 
                            value={nullToNothing (name)} 
                            onChange={handleNameChanged}/>
                    <input  disabled={busy} className="btn btn-outline-secondary" type={"button"} value="Seed" onClick={handleSeed}/>
                </div>
                <div className="input-group mb-3">
                    <input  ref={contentInput}
                            type={"text"} 
                            className={`form-control ${getInvalidClassName (contentIsInvalid)}`}
                            placeholder="Content"
                            value={nullToNothing (content)}
                            onChange={handleContentChanged}/>
                    <input  disabled={busy} className="btn btn-outline-secondary" type={"submit"} value="Send"/>
                </div>                        
            </form>
        </div>
  )
};
