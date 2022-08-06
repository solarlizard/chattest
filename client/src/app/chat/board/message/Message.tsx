import React from "react";


import { MessageModel } from "../../../../generated/shared";

import styles from "./Message.module.css"

import { formatDateDiff } from "../../../../util/formatDateDiff";
import { stringToHslColor } from "../../../../util/stringToColor";

export interface MessageProps {
    message : MessageModel
}

export const Message = (props : MessageProps) => {

    const formatDate = (value : string) => {
        
        const now = new Date ()
        const date = new Date (Date.parse (value))

        return formatDateDiff (now, date)
    }

    const renderDeletedMessage = () => (
        <div>Deleted</div>
    )

    const renderActiveMessage = (state : MessageModel.ActiveStateModel) => (
        <div>
            <div className={styles.Header}>
                <div className={styles.AuthorNamBlock} style={{overflow: "hidden"}}>
                    <div className={`${styles.AuthorName}`} style={{color : stringToHslColor (state.author)}}>{state.author}</div>
                </div>
                <div className={`${styles.Date}`}>{formatDate (state.created)}</div>
            </div>
            <div>{state.content}</div>
        </div>
    )

    const renderMessage = () => {
        if (props.message.state.type === 'active') {
            return renderActiveMessage (props.message.state)
        }
        else {
            return renderDeletedMessage ()
        }
    }

    return (
        <div className={styles.Message}>
            {renderMessage ()}
        </div>
    )
};
