import { Renderer } from "./renderer/render.js";

async function main() {
  const renderer = new Renderer();

  const data = {
    user: {
      name: "Andrey Allyson",
    },
    age: 21,
  };

  const html = await renderer.render("test1", data);

  console.log(html);
}

main();
