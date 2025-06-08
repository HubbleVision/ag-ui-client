export type UIEventHandler = (
  props: Record<string, any>,
  next: (nextProps?: Record<string, any>) => void,
  stop: () => void
) => void | Record<string, any> | any | Promise<void | Record<string, any> | any>;

export interface UIEventChainItem {
  event: string;
  props: Record<string, any>;
}

// Batch event input format
export interface UIEventBatchItem {
  event: string;
  props?: Record<string, any>;
}

// Declarative event chain definition
export interface DeclaredChain {
  id: string;
  items: UIEventChainItem[];
  createdAt: number;
  metadata?: Record<string, any>;
}

// Simplified UIBridge interface
export interface UIBridgeInterface {
  // Event listening
  on(event: string, callback: UIEventHandler): () => void;
  
  // Declarative API - define event chain but do not execute
  chain(chainId: string): ChainBuilder;
  
  // Consume API - execute and delete declared event chain
  consume(chainId: string): Promise<any>;
  
  // Check if specified event chain exists
  hasChain(chainId: string): boolean;
  
  // Get all declared event chains
  getChains(): Map<string, DeclaredChain>;
  
  // Clear specified or all event chains
  clear(chainId?: string): void;
}

// Chain builder interface
export interface ChainBuilder {
  add(event: string, props?: Record<string, any>): ChainBuilder;
  sleep(duration: number): ChainBuilder;
  batch(events: UIEventBatchItem[]): ChainBuilder;
  meta(metadata: Record<string, any>): ChainBuilder;
  build(): DeclaredChain;
}
