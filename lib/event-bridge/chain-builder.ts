import { ChainBuilder, UIEventChainItem, UIEventBatchItem, DeclaredChain } from "./types";

// Special event types
const SLEEP_EVENT = "__SLEEP__";

export class UIChainBuilder implements ChainBuilder {
  private chainId: string;
  private items: UIEventChainItem[] = [];
  private metadata: Record<string, any> = {};

  constructor(chainId: string) {
    this.chainId = chainId;
  }

  /**
   * Add event to chain
   */
  add(event: string, props: Record<string, any> = {}): ChainBuilder {
    this.items.push({ event, props });
    return this;
  }

  /**
   * Add delay
   */
  sleep(duration: number): ChainBuilder {
    return this.add(SLEEP_EVENT, { duration });
  }

  /**
   * Batch add events
   */
  batch(events: UIEventBatchItem[]): ChainBuilder {
    events.forEach((item) => {
      if (item.event === "sleep" && item.props?.duration) {
        this.sleep(item.props.duration);
      } else {
        this.add(item.event, item.props || {});
      }
    });
    return this;
  }

  /**
   * Set metadata
   */
  meta(metadata: Record<string, any>): ChainBuilder {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  /**
   * Build declarative event chain
   */
  build(): DeclaredChain {
    return {
      id: this.chainId,
      items: [...this.items], // Copy array to avoid reference issues
      createdAt: Date.now(),
      metadata: { ...this.metadata }
    };
  }
} 