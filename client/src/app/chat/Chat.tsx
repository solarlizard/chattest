import React, { useState, useEffect } from "react";

import styles from "./Chat.module.css"

import {Board} from "./board/Board"
import {Input} from "./input/Input"
import { MessageModel } from "../../generated/shared";
import { ListenMessagesResponse } from "../../generated/ListenMessagesResponse";
import { Logger } from "../../util/Logger";
import { SERVER } from "./Server";

export const Chat = () => {

    const [messages, setMessages] = useState<MessageModel []> ([])

    const logger = React.useRef (new Logger ("Chat"))

    const shrinkList = (list : MessageModel []) => {
        if (list.length > 20) {
            return list.splice (list.length - 20)
        }
        else {
            return list
        }
    }
    
    const handleMessage = (message : MessageModel) => setMessages (list => {
            const index = list.findIndex (item => item.id === message.id)

            if (index >= 0) {
                list[index] = message
                return list
            }
            else {
                return shrinkList([...list, message])
            }
        }
    )

    useEffect(() => {

        const handleSocketResponse = (response : ListenMessagesResponse) => {
            if (response.type === 'success') {
                
                if (response.result.type === 'list') {
                    setMessages (shrinkList(response.result.messages))
                }
                else {
                    handleMessage (response.result.message)
                }
            }
            else {
                logger.current.error ("Invalid response", {response})
            }
    
        }
                
        const socket = SERVER.listenMessages (handleSocketResponse)

        return () => {
            socket.close ()
        }
    }, []);
    
    console.log ("RERENDER")

    return (
        <div className={styles.Chat} style={{overflow: "hidden"}}>
            <Board messages={messages}/>
            <Input onMessage={handleMessage}/>
        </div>
    )
};
