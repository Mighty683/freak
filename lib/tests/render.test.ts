import { createRoot, renderElement } from "../render";
import { ComponentFunction } from "../types";
describe("rendering", () => {
  const element = document.createElement("div");
  beforeEach(() => {
    document.body.innerHTML = "";
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });
  describe("createRoot", () => {
    it("should render div element with renderElement", () => {
      createRoot({
        element,
        renderRoot: renderElement({
          tag: "div",
          attributes: { id: "test-div" },
        }),
      });
      expect(document.body.querySelector("#test-div")).not.toBeNull();
    });
  });

  describe("render", () => {
    describe("static rendering", () => {
      it("should render with custom component function", async () => {
        const customComponentFunction: ComponentFunction = () => {
          return renderElement({
            tag: "span",
            attributes: { id: "custom-span" },
          });
        };
        await createRoot({
          element,
          renderRoot: renderContext => customComponentFunction(renderContext),
        });
        expect(document.body.querySelector("#custom-span")).not.toBeNull();
      });
      it("should render custom async component function", async () => {
        const customAsyncComponentFunction: ComponentFunction = async () => {
          await new Promise(resolve => setTimeout(resolve, 1));
          return renderElement({
            tag: "section",
            attributes: { id: "async-section" },
          });
        };
        customAsyncComponentFunction.displayName = "CustomAsyncComponent";
        await createRoot({
          element,
          renderRoot: renderContext =>
            customAsyncComponentFunction(renderContext),
        });
        expect(document.body.querySelector("#async-section")).not.toBeNull();
      });
    });

    describe("stateful rendering", () => {
      it("should unmount previous content when re-rendering", async () => {
        const customComponentFunction: ComponentFunction<boolean> = (
          renderContext,
          renderItem: boolean
        ) => {
          const [renderState, setRenderState] =
            renderContext.state<boolean>(renderItem);
          if (renderState) {
            return renderElement({
              tag: "p",
              attributes: { id: "conditional-paragraph" },
              listeners: {
                click: () => {
                  setRenderState(false);
                },
              },
            });
          }
        };
        const root = await createRoot({
          element,
          renderRoot: renderContext =>
            customComponentFunction(renderContext, true),
        });
        expect(
          document.body.querySelector("#conditional-paragraph")
        ).not.toBeNull();
        document.body
          .querySelector<HTMLParagraphElement>("#conditional-paragraph")
          ?.click();
        await root.renderContext.renderPromise;
        expect(
          document.body.querySelector("#conditional-paragraph")
        ).toBeNull();
      });
    });
  });
});
