export type DefaultDynamicContext = undefined;
export type RenderContext<TreeContext = DefaultDynamicContext> = {
  renderPromise?: Promise<void>;
  currentNode: RenderNode;
} & RenderAPI<TreeContext>;
export type PromiseWithType<T> = Promise<T> | T;
export type PromiseWithVoid = PromiseWithType<void>;
export type RenderAPI<RenderApiTreeContext = DefaultDynamicContext> = {
  // TODO: implement
  mount(
    callback: () => PromiseWithVoid | (() => PromiseWithVoid)
  ): PromiseWithVoid;
  // TODO: implement
  dynamicContext<
    DynamicContext = RenderApiTreeContext
  >(): RenderContext<DynamicContext>["dynamicContext"];
  // TODO: implement
  // TODO: How connect state with render closure?
  state<T>(initialValue: T): [T, (newValue: T) => void];
  render(
    callback: RenderFunctionCallback<RenderApiTreeContext>
  ): PromiseWithVoid;
};

export type RenderFunctionReturn<DynamicContext = DefaultDynamicContext> =
  | PromiseWithVoid
  | PromiseWithType<RenderFunctionCallback<DynamicContext>>;
export interface RenderFunctionCallback<
  DynamicContext = DefaultDynamicContext
> {
  (
    renderContext: RenderContext<DynamicContext>
  ): RenderFunctionReturn<DynamicContext>;
  displayName?: string;
}
export interface ComponentFunction<
  Props = undefined,
  DynamicContext = DefaultDynamicContext
> {
  (
    ...args: Props extends undefined
      ? [renderContext: RenderContext<DynamicContext>]
      : [renderContext: RenderContext<DynamicContext>, props: Props]
  ): RenderFunctionReturn<DynamicContext>;
  displayName?: string;
}
/**
 * TODO:
 * - Compiler to handle attributes and listeners
 * - JSX support
 */
export type CreateElementProps = {
  tag: string;
  listeners?: { [event: string]: EventListener };
  attributes?: { [attribute: string]: string };
};
export type CreateRootConfig<InitialContext = unknown> = {
  element: HTMLElement;
  renderRoot: ComponentFunction<undefined, InitialContext>;
  initialContext?: InitialContext;
};
export type CreateRootReturn = {
  renderContext: RenderContext;
  rootElement: HTMLElement;
};
export type CreateRootFunction<InitialDynamicContext = DefaultDynamicContext> =
  (
    config: CreateRootConfig<InitialDynamicContext>
  ) => PromiseWithType<CreateRootReturn>;
export type RenderNode = {
  child?: RenderNode;
  currentElement: HTMLElement;
  functionRef: Function;
};
