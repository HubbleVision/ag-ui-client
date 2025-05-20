import {
  UIEventHandler,
  UIEventChainItem,
  UIBridgeInterface,
  UIEventBatchItem,
} from "./types";
import EventEmitter from "eventemitter3";

// Define a special sleep event type
const SLEEP_EVENT = "__SLEEP__";

export class UIBridge implements UIBridgeInterface {
  private _emitter = new EventEmitter();
  private _eventChain: UIEventChainItem[] = [];
  private _isProcessing = false; // Flag indicating whether event chain is being processed

  constructor() {
    // Register internal sleep handler
    // When sleep event is triggered, delay execution of next event by specified duration
    this._emitter.on(SLEEP_EVENT, (props, next, stop) => {
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
  public on(event: string, callback: UIEventHandler) {
    // Wrap callback to ensure next is always called unless stop is explicitly called
    const wrappedCallback = (
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

        // If callback returned a value, handle it
        if (result !== undefined) {
          // Special handling for object type returns
          if (typeof result === "object" && result !== null) {
            // Use returned object as props for next event
            next(result);
          } else {
            // Wrap non-object returns in an object
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
   * Add an event to the event chain
   * @param event Event name
   * @param props Event parameters object
   * @returns This instance for chaining
   */
  public add(event: string, props: Record<string, any> = {}): UIBridge {
    // Add event to chain
    this._eventChain.push({ event, props });

    // Start processing if no events are currently being processed
    if (!this._isProcessing) {
      this._processNextEvent();
    }

    return this;
  }

  /**
   * Add a delay to the event chain
   * @param duration Delay duration in milliseconds
   * @returns This instance for chaining
   */
  public sleep(duration: number): UIBridge {
    return this.add(SLEEP_EVENT, { duration });
  }

  /**
   * Batch add events to the event chain
   * @param events Array of events, each containing event name and optional parameters
   * @returns This instance
   */
  public batch(events: UIEventBatchItem[]): UIBridge {
    // Clear current event chain to avoid mixing
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
    this._isProcessing = false;
    return this;
  }

  /**
   * Process next event in the chain
   * @param prevProps Parameters passed from previous event
   */
  private _processNextEvent(prevProps: Record<string, any> = {}) {
    // End processing if no more events
    if (this._eventChain.length === 0) {
      this._isProcessing = false;
      return;
    }

    // Mark as processing
    this._isProcessing = true;

    // Get and remove first event
    const currentEvent = this._eventChain.shift()!;
    const eventProps = {
      ...currentEvent.props,
      prev: prevProps,
    };

    // Check if event has listeners
    if (this._emitter.listenerCount(currentEvent.event) > 0) {
      this._emitter.emit(
        currentEvent.event,
        eventProps,
        (nextProps: Record<string, any> = {}) => {
          // Process next event
          this._processNextEvent(nextProps);
        }
      );
    } else {
      // If no listeners, process next event directly
      this._processNextEvent(prevProps);
    }
  }
}

// Export global singleton
export const ui = new UIBridge();
