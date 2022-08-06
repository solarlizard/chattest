import React, {useRef, useState } from "react";
import { MessageModel } from "../../../generated/shared";
import { Logger } from "../../../util/Logger";
import { retryPromise } from "../../../util/retryPromise";
import { SERVER } from "../Server";

import styles from "./Board.module.css"

import {Message} from "./message/Message"

export interface BoardProps {
    messages : MessageModel []
}

const logger = new Logger ("Board")

export const Board = (props : BoardProps) => {

    const boardRerf = useRef<HTMLDivElement> (null)
    const mouseIsOver = React.useRef(false)

    const bottomRef = React.useRef<HTMLDivElement>(null);
    
    const [pagedMessages, setPagedMessages] = useState<MessageModel []> ([])

    const handleMouseOver = () => mouseIsOver.current = true
    const handleMouseLeave = () => mouseIsOver.current = false

    React.useEffect(() => {
        
        if (!mouseIsOver.current) {
            bottomRef.current?.scrollIntoView({});
        }   

    }, [props.messages]);

    const handleScroll = (e : React.UIEvent<HTMLDivElement>) => {

        if (props.messages.length === 0) {
            return
        }
        
        const checkScrolledToBottom = () => boardRerf.current!.scrollHeight - boardRerf.current!.scrollTop - boardRerf.current!.clientHeight === 0

        if (checkScrolledToBottom ()) {
            setPagedMessages ([])
        }
    }

    const handleWheelIsBusy = useRef (false)
    const lastScrollTime = useRef (0)

    const handleWheel = (e : React.WheelEvent<HTMLDivElement>) => {
        
        if (handleWheelIsBusy.current) {
            return
        }
        
        if (e.deltaY < -30) {

            const now = Date.now ()

            if (now - lastScrollTime.current < 1000) {
                return
            }
            
            lastScrollTime.current = now
    
            if (boardRerf.current?.scrollTop === 0) {
                
                const calculateBeforeIndex = () => {
                    if (pagedMessages.length > 0) {
                        return pagedMessages[0].index
                    }
                    else if (props.messages.length > 0) {
                        return props.messages[0].index
                    }
                    else {
                        return null
                    }
                }

                const beforeIndex = calculateBeforeIndex ()

                if (beforeIndex === null) {
                    return
                }
                
                handleWheelIsBusy.current = true

                retryPromise (logger, () => SERVER.listMessagesBefore (beforeIndex))
                    .then (response => {
                        if (response.type === 'success') {
                            setPagedMessages (list => [...response.messages,...list])
                        }
                        else {
                            logger.error ("Invalid pading response", {response})
                        }
                    })
                    .finally (() => {
                        handleWheelIsBusy.current = false
                    })
        
        
            }
        }
    }
    
    return (
        <div ref={boardRerf} className={styles.Board} onMouseEnter={handleMouseOver} onMouseLeave={handleMouseLeave} onScroll={handleScroll} onWheelCapture={handleWheel}>
            {pagedMessages.map (item => <Message key={item.id} message={item}/>)}   
            {props.messages.map (item => <Message key={item.id} message={item}/>)}   
            <div ref={bottomRef} />
        </div>
      )
};
