import React from "react";
import { render} from "@testing-library/react";
import {Board} from "./Board";

test("Board", () => {
  window.HTMLElement.prototype.scrollIntoView = function() {};
  (window as any).setImmediate = () => {}

  render(<Board messages={[{
    id : 'id1',
    index : 1,
    ver : 0,
    state : {
      type : 'active',
      author : 'author',
      content : 'content',
      created : new Date ().toUTCString (),      
    }
  },{
    id : 'id2',
    index : 2,
    ver : 0,
    state : {
      type : 'deleted',
      deleted : new Date ().toUTCString (),
    }
  }]} />);
});
