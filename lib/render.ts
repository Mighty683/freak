import {
  CreateElementProps,
  CreateRootFunction,
  ComponentContext,
  RenderNode,
  RenderContext,
} from "./types";

const createContext = (rootElement: HTMLElement): ComponentContext => {
  const rootFunctionRef = () => {};
  const rootNode: RenderNode = {
    currentElement: rootElement,
    state: {},
    functionRef: rootFunctionRef,
  };
  const renderContext: RenderContext = {
    currentNode: rootNode,
  };

  const componentContext: ComponentContext = {
    state: <T>(initialValue: T): [T, (newValue: T) => void] => {
      const renderNode = renderContext.currentNode;
      // TODO: How retrieve state between renders?
      const stateSymbol = Symbol("state");
      let stateValue = (renderNode.state[stateSymbol] as T) || initialValue;
      const setState = (newValue: T) => {
        stateValue = newValue;

        renderNode.state[stateSymbol] = [
          newValue,
          renderNode.state[stateSymbol][1],
        ];
        componentContext.render(renderNode.functionRef as any);
      };
      const stateArray: [T, (newValue: T) => void] = [stateValue, setState];
      if (!(stateSymbol in renderNode.state)) {
        renderNode.state[stateSymbol] = stateArray;
      }

      return stateArray;
    },
    render: async component => {
      const newRenderNode: RenderNode = {
        currentElement: renderContext.currentNode.currentElement,
        functionRef: component,
        state: {},
      };
      if (renderContext.currentNode) {
        renderContext.currentNode.child = newRenderNode;
        renderContext.currentNode = newRenderNode;
      } else {
        renderContext.currentNode = newRenderNode;
      }
      const renderPromise = new Promise<void>(async resolve => {
        const child = await component(componentContext, renderContext);
        if (child instanceof Function) {
          await componentContext.render(child);
        }
        resolve();
      });
      componentContext.renderPromise = renderPromise;
      await renderPromise
        .catch(() => {
          // TODO: handle errors
        })
        .finally(() => {
          componentContext.renderPromise = undefined;
        });
    },
  } as ComponentContext;

  return componentContext;
};

export const createRoot: CreateRootFunction = async config => {
  const rootContext = createContext(config.element);
  await rootContext.render(componentContext =>
    config.renderRoot(componentContext)
  );
  return {
    renderContext: rootContext,
    rootElement: config.element,
  };
};

export const renderElement = (props: CreateElementProps) => {
  const renderElementFunction = async (componentContext: ComponentContext) => {
    componentContext.render((_, renderContext) => {
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
