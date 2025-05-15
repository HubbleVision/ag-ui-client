export type UIEventHandler = (
  props: Record<string, any>,
  next: (nextProps?: Record<string, any>) => void,
  stop: () => void
) => void | Record<string, any> | any;

export interface UIEventChainItem {
  event: string;
  props: Record<string, any>;
}

// 批量事件输入格式
export interface UIEventBatchItem {
  event: string;
  props?: Record<string, any>;
}

export interface UIBridgeInterface {
  on(event: string, callback: UIEventHandler): () => void;
  add(event: string, props?: Record<string, any>): UIBridgeInterface;
  sleep(duration: number): UIBridgeInterface;
  batch(events: UIEventBatchItem[]): UIBridgeInterface;
  clear(): UIBridgeInterface;
}
