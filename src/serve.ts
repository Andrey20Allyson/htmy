import { IncomingMessage, Server, ServerResponse } from "http";
import { Renderer } from "./renderer/render";
import { JSScope } from "./evaluator/evaluate-js";

const renderer = new Renderer();

class AppResponse {
  constructor(readonly inner: ServerResponse) {}

  render(name: string, data: JSScope): AppResponse {
    renderer.render(name, data).then((html) => {
      this.inner.setHeader("Content-Type", "text/html");
      this.inner.write(html);
      this.inner.end();
    });

    return this;
  }

  status(code: number): AppResponse {
    this.inner.statusCode = code;

    return this;
  }
}

async function httpHandler(req: IncomingMessage, res: ServerResponse) {
  await appHandler(req, new AppResponse(res));
}

async function appHandler(req: IncomingMessage, res: AppResponse) {
  const data = {
    user: {
      name: "Andrey Allyson",
    },
    age: 21,
  };

  res.render("test1", data);
}

const server = new Server(httpHandler);

server.listen(8080, "localhost", () => {
  console.log("server listening http://localhost:8080");
});
