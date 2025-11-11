import {
  CreateElementProps,
  CreateRootFunction,
  RenderContext,
  RenderFunctionCallback,
  RenderNode,
} from "./types";

const createContext = (rootElement: HTMLElement): RenderContext => {
  const rootFunctionRef = () => {};
  const rootNode: RenderNode = {
    currentElement: rootElement,
    functionRef: rootFunctionRef,
  };

  const context: RenderContext = {
    currentNode: rootNode,
    state: <T>(initialValue: T): [T, (newValue: T) => void] => {
      let stateValue = initialValue;
      const setState = (newValue: T) => {
        stateValue = newValue;
      };
      return [stateValue, setState];
    },
    render: async component => {
      const newRenderNode: RenderNode = {
        currentElement: context.currentNode.currentElement,
        functionRef: component,
      };
      const renderPromise = new Promise<void>(async resolve => {
        const child = await component(context);
        if (child instanceof Function) {
          await child(context);
        }
        resolve();
      });
      context.renderPromise = renderPromise;
      await renderPromise
        .catch(() => {
          // TODO: handle errors
        })
        .finally(() => {
          context.renderPromise = undefined;
        });
      newRenderNode.currentElement = context.currentNode.currentElement;
      if (context.currentNode) {
        context.currentNode.child = newRenderNode;
        context.currentNode = newRenderNode;
      } else {
        context.currentNode = newRenderNode;
      }
    },
  } as RenderContext;

  return context;
};

export const createRoot: CreateRootFunction = async config => {
  const rootContext = createContext(config.element);
  await rootContext.render(renderContext => config.renderRoot(renderContext));
  return {
    renderContext: rootContext,
    rootElement: config.element,
  };
};

export const renderElement = (props: CreateElementProps) => {
  const renderElementFunction: RenderFunctionCallback = async (
    renderContext: RenderContext
  ) => {
    renderContext.render(() => {
      const element = document.createElement(props.tag);
      if (props.attributes) {
        for (const [key, value] of Object.entries(props.attributes)) {
          element.setAttribute(key, value);
        }
      }
      if (props.listeners) {
        for (const [event, listener] of Object.entries(props.listeners)) {
          element.addEventListener(event, listener);
        }
      }
      renderContext.currentNode.currentElement.appendChild(element);
      return void undefined;
    });
  };
  renderElementFunction.displayName = `RenderElement(${props.tag})`;
  return renderElementFunction;
};
