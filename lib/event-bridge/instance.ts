import {
  Context,
  ContextItem,
  UIEventHandler,
  UIEventChainItem,
  UIBridgeInterface,
  UIEventBatchItem,
} from "./types";
import EventEmitter from "eventemitter3";
import { v4 as uuidv4 } from "uuid";

// Define a special event type for sleep
const SLEEP_EVENT = "__SLEEP__";

export class UIBridge implements UIBridgeInterface {
  private _emitter = new EventEmitter();
  private _eventChain: UIEventChainItem[] = [];

  constructor() {
    // Register internal sleep handler
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
   * @param callback Callback function that receives props and next function
   * @returns Function to cancel the listener
   */
  public on(event: string, callback: UIEventHandler) {
    this._emitter.on(event, callback);
    return () => {
      this._emitter.off(event, callback);
    };
  }

  /**
   * Add an event to the call chain
   * @param event Event name
   * @param props Event parameters
   * @returns this instance, supports chain calls
   */
  public add(event: string, props: Record<string, any> = {}): UIBridge {
    this._eventChain.push({ event, props });

    // If there's only one event, execute immediately
    if (this._eventChain.length === 1) {
      this._executeChain(0, {});
    }

    return this;
  }

  /**
   * Add a delay to the call chain
   * @param duration Delay time in milliseconds
   * @returns this instance, supports chain calls
   */
  public sleep(duration: number): UIBridge {
    return this.add(SLEEP_EVENT, { duration });
  }

  /**
   * Batch add events to the call chain
   * @param events Array of events, each containing event name and optional props
   * @returns this instance
   */
  public batch(events: UIEventBatchItem[]): UIBridge {
    // Clear current chain to avoid mixing
    this.clear();

    events.forEach((item) => {
      if (item.event === "sleep" && item.props?.duration) {
        // Handle special sleep event
        this.sleep(item.props.duration);
      } else {
        this.add(item.event, item.props || {});
      }
    });

    return this;
  }

  /**
   * Clear the event chain
   */
  public clear(): UIBridge {
    this._eventChain = [];
    return this;
  }

  /**
   * Execute the event chain
   * @param index Index of the current event
   * @param prevProps Parameters passed from the previous event
   */
  private _executeChain(index: number, prevProps: Record<string, any>) {
    if (index >= this._eventChain.length) {
      // Chain execution complete, clear the chain
      this._eventChain = [];
      return;
    }

    const currentEvent = this._eventChain[index];
    const eventProps = {
      ...currentEvent.props,
      prev: prevProps,
    };

    // Check if the event has listeners
    if (this._emitter.listenerCount(currentEvent.event) > 0) {
      this._emitter.emit(
        currentEvent.event,
        eventProps,
        (nextProps: Record<string, any> = {}) => {
          // Execute the next event in the chain
          this._executeChain(index + 1, nextProps);
        }
      );
    } else {
      // If no listeners, execute the next one
      this._executeChain(index + 1, prevProps);
    }
  }
}

// Define top-level context type
export type WrapContext = {
  [key: string]: Context;
};

/**
 * EventBridge Class - Central context management bus
 * Used to manage context data for all components
 */
export class EventBridge {
  private _emitter = new EventEmitter();

  // Store all context data
  public context: WrapContext = {};

  constructor() {}

  /**
   * Add a new context
   * @param context Context object
   */
  public addContext(
    context: Omit<ContextItem, "id"> & { id?: string },
    keepAlive = true
  ) {
    if (!context.id) {
      const arrs = this.context[context.from] || [];
      const id = uuidv4();
      arrs.push({ ...context, id });
      this.context[context.from] = arrs;
      this._emitter.emit("contextChange", this.context, context.from, () => {
        if (!keepAlive) {
          queueMicrotask(() => {
            this.context[context.from] = arrs.filter((item) => item.id !== id);
          });
        }
      });
      return id;
    }
    return context.id;
  }

  /**
   * Remove a context by ID
   * @param context_id Context ID
   */
  public removeContext(context_id: string) {
    let remove_from: string | undefined;
    for (const [from, items] of Object.entries(this.context)) {
      const index = items.findIndex((item) => item.id === context_id);
      if (index !== -1) {
        items.splice(index, 1);
        remove_from = from;
        this.context[from] = items;
        break;
      }
      this.context[from] = items;
    }
    this._emitter.emit("contextChange", this.context, remove_from);
  }

  /**
   * Update an existing context
   * @param context Updated context object
   */
  public updateContext(context: ContextItem, keepAlive = true) {
    if (!context.id) return;
    let update_from: string;
    const arrs = this.context[context.from] || [];
    const index = arrs.findIndex((item) => item.id === context.id);
    if (index !== -1) {
      arrs[index] = context;
      update_from = context.from;
      this.context[context.from] = arrs;
      this._emitter.emit("contextChange", this.context, update_from, () => {
        if (!keepAlive) {
          queueMicrotask(() => {
            this.context[update_from] = arrs.filter(
              (item) => item.id !== context.id
            );
          });
        }
      });
      return arrs[index]!.id;
    }
  }

  /**
   * Listen for context changes
   * @param callback Change callback function
   */
  public onContextChange(
    callback: (context: WrapContext, from: string, end?: () => void) => void
  ) {
    this._emitter.on("contextChange", callback);
    return () => {
      this._emitter.off("contextChange", callback);
    };
  }
}

// Create global singleton
export const bus = new EventBridge();
export const ui = new UIBridge();
