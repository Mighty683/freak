export type DefaultDynamicContext = undefined;
export type ComponentContext<TreeContext = DefaultDynamicContext> = {
  renderPromise?: Promise<void>;
} & ComponentAPI<TreeContext>;
export type RenderContext = {
  currentNode: RenderNode;
};
export type PromiseWithType<T> = Promise<T> | T;
export type PromiseWithVoid = PromiseWithType<void>;
export type ComponentAPI<RenderApiTreeContext = DefaultDynamicContext> = {
  // TODO: implement
  mount(
    callback: () => PromiseWithVoid | (() => PromiseWithVoid)
  ): PromiseWithVoid;
  // TODO: implement
  dynamicContext<
    DynamicContext = RenderApiTreeContext
  >(): ComponentContext<DynamicContext>["dynamicContext"];
  // TODO: implement
  // TODO: How connect state with render closure?
  state<T>(initialValue: T): [T, (newValue: T) => void];
  render(
    callback: RenderFunctionCallback<RenderApiTreeContext>
  ):
    | PromiseWithVoid
    | PromiseWithType<RenderFunctionCallback<RenderApiTreeContext>>;
};

export type ComponentFunctionReturn<DynamicContext = DefaultDynamicContext> =
  | PromiseWithVoid
  | PromiseWithType<RenderFunctionCallback<DynamicContext>>;
export interface RenderFunctionCallback<
  DynamicContext = DefaultDynamicContext
> {
  (
    componentContext: ComponentContext,
    renderContext: RenderContext
  ): ComponentFunctionReturn<DynamicContext>;
  displayName?: string;
}
export interface ComponentFunction<
  Props = undefined,
  DynamicContext = DefaultDynamicContext
> {
  (
    ...args: Props extends undefined
      ? [renderContext: ComponentContext<DynamicContext>]
      : [renderContext: ComponentContext<DynamicContext>, props: Props]
  ): ComponentFunctionReturn<DynamicContext>;
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
  renderContext: ComponentContext;
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
