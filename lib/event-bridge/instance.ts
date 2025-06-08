import {
  UIEventHandler,
  UIBridgeInterface,
  DeclaredChain,
  ChainBuilder,
  UIEventBatchItem,
} from "./types";
import { UIChainBuilder } from "./chain-builder";
import EventEmitter from "eventemitter3";

// Define special event types
const SLEEP_EVENT = "__SLEEP__";

export class UIBridge implements UIBridgeInterface {
  private _emitter = new EventEmitter();
  private _declaredChains = new Map<string, DeclaredChain>();

  constructor() {
    // Register internal sleep handler
    // When sleep event is triggered, delay execution of next event by specified duration
    this._emitter.on(SLEEP_EVENT, (props, next) => {
      const { duration = 0 } = props;
      setTimeout(() => {
        next(props.prev || {});
      }, duration);
    });
  }

  /**
   * Register an event listener
   * @param event Event name
   * @param callback Callback function that receives event props, next function and stop function as parameters
   * @returns Function to unsubscribe the listener
   */
  public on(event: string, callback: UIEventHandler): () => void {
    // Wrap callback to ensure next is always called unless stop is explicitly called
    const wrappedCallback = async (
      props: Record<string, any>,
      next: (nextProps?: Record<string, any>) => void
    ) => {
      let isStopped = false;

      // Define stop function that prevents event chain from continuing when called
      const stop = () => {
        isStopped = true;
      };

      try {
        // Execute original callback with props, next and stop functions
        const result = callback(props, next, stop);

        // If stop was called, don't continue event chain
        if (isStopped) {
          return;
        }

        // Handle Promise return values
        if (result && typeof result.then === 'function') {
          const awaited = await result;
          if (isStopped) return;
          
          if (awaited !== undefined) {
            if (typeof awaited === "object" && awaited !== null) {
              next(awaited);
            } else {
              next({ value: awaited, prev: props });
            }
          } else {
            next(props);
          }
        } else if (result !== undefined) {
          // Handle synchronous return values
          if (typeof result === "object" && result !== null) {
            next(result);
          } else {
            next({ value: result, prev: props });
          }
        } else {
          // No return value, call next with original props
          next(props);
        }
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
        // Continue event chain unless explicitly stopped, to avoid breaking entire chain
        if (!isStopped) {
          next(props);
        }
      }
    };

    this._emitter.on(event, wrappedCallback);
    return () => {
      this._emitter.off(event, wrappedCallback);
    };
  }

  /**
   * Declarative API - create event chain builder
   */
  public chain(chainId: string): ChainBuilder {
    const builder = new UIChainBuilder(chainId);
    
    // Create a proxy object containing all builder methods
    const proxy: ChainBuilder = {
      add: (event: string, props?: Record<string, any>) => {
        builder.add(event, props);
        return proxy;
      },
      sleep: (duration: number) => {
        builder.sleep(duration);
        return proxy;
      },
      batch: (events: UIEventBatchItem[]) => {
        builder.batch(events);
        return proxy;
      },
      meta: (metadata: Record<string, any>) => {
        builder.meta(metadata);
        return proxy;
      },
      build: () => {
        const chain = builder.build();
        this._declaredChains.set(chainId, chain);
        return chain;
      }
    };
    
    return proxy;
  }

  /**
   * Consume API - execute and delete specified event chain
   */
  public async consume(chainId: string): Promise<any> {
    const chain = this._declaredChains.get(chainId);
    if (!chain) {
      console.warn(`Chain "${chainId}" not found. Please declare it first using ui.chain("${chainId}").add(...).build()`);
      return;
    }

    // Immediately delete declaration to ensure it executes only once
    this._declaredChains.delete(chainId);

    console.log(`🚀 Consuming chain "${chainId}" with ${chain.items.length} events`);

    // Execute event chain
    return this._executeChain(chain.items);
  }

  /**
   * Check if event chain exists
   */
  public hasChain(chainId: string): boolean {
    return this._declaredChains.has(chainId);
  }

  /**
   * Get all declared event chains
   */
  public getChains(): Map<string, DeclaredChain> {
    return new Map(this._declaredChains);
  }

  /**
   * Clear event chains
   */
  public clear(chainId?: string): void {
    if (chainId) {
      this._declaredChains.delete(chainId);
    } else {
      this._declaredChains.clear();
    }
  }

  /**
   * Private method to execute event chain
   */
  private async _executeChain(items: Array<{ event: string; props: Record<string, any> }>): Promise<any> {
    let prevProps = {};

    for (const item of items) {
      const eventProps = {
        ...item.props,
        prev: prevProps,
      };

      if (this._emitter.listenerCount(item.event) > 0) {
        // Wait for event processing to complete
        prevProps = await new Promise<Record<string, any>>((resolve) => {
          this._emitter.emit(item.event, eventProps, (nextProps = {}) => {
            resolve(nextProps);
          });
        });
      } else {
        // No listeners, pass through directly
        prevProps = eventProps;
      }
    }

    return prevProps;
  }

  // For compatibility, keep some simplified methods
  /**
   * @deprecated Use ui.chain(id).add(...).build() instead
   */
  public add(event: string, props: Record<string, any> = {}) {
    console.warn("ui.add() is deprecated. Use ui.chain(id).add(...).build() instead");
    return this.chain(`auto_${Date.now()}`).add(event, props);
  }
}

// Export global singleton
export const ui = new UIBridge();
