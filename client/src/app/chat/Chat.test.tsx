import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { getByText, render, screen, waitFor } from "@testing-library/react";
import {Chat} from "./Chat";
import { MessageModel } from "../../generated/shared";
import { ListenMessagesResponse } from "../../generated/ListenMessagesResponse";
const socketIOClient = require ('socket.io-client');
const MockedSocket = require ('socket.io-mock');

jest.mock('socket.io-client');

describe('Chat', () => {
    let socket : any;
    let container : any;

    beforeEach(() => {
        socket = new MockedSocket();
        socketIOClient.mockReturnValue(socket);

        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.removeChild(container);
        container = null;
    });

    it('First message list receive', async () =>  {

        // prepare

        const response : ListenMessagesResponse = ({
          type : 'success',
          result : {
            type : 'list',
            messages : [{
              id : 'id',
              index : 0,
              ver : 0,
              state : {
                type : 'active',
                author : 'author',
                content : 'testMessageContent1',
                created : new Date ().toUTCString (),
              }
            }  ]
          }
      })

      act(() => {
          render(<Chat />);
      });

      // test
      act (() => {
        socket.socketClient.emit('data', response);
      })

      // assert
      await waitFor (() => screen.findByText ("testMessageContent1"), {
        timeout : 5000
      })

    });

})
