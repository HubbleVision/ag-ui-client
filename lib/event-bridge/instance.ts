import {
  UIEventHandler,
  UIEventChainItem,
  UIBridgeInterface,
  UIEventBatchItem,
} from "./types";
import EventEmitter from "eventemitter3";

// 定义一个特殊的休眠事件类型
const SLEEP_EVENT = "__SLEEP__";

export class UIBridge implements UIBridgeInterface {
  private _emitter = new EventEmitter();
  private _eventChain: UIEventChainItem[] = [];
  private _isProcessing = false; // 标志是否正在处理事件链

  constructor() {
    // 注册内部休眠处理器
    // 当触发休眠事件时,延迟指定时间后执行下一个事件
    this._emitter.on(SLEEP_EVENT, (props, next, stop) => {
      const { duration = 0 } = props;
      setTimeout(() => {
        next(props.prev || {});
      }, duration);
    });
  }

  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param callback 回调函数,接收事件参数、next函数和stop函数作为参数
   * @returns 返回一个取消监听的函数
   */
  public on(event: string, callback: UIEventHandler) {
    // 包装回调函数，确保总是会调用next，除非显式调用了stop
    const wrappedCallback = (
      props: Record<string, any>,
      next: (nextProps?: Record<string, any>) => void
    ) => {
      let isStopped = false;

      // 定义stop函数，调用后会阻止事件链继续执行
      const stop = () => {
        isStopped = true;
      };

      try {
        // 执行原始回调，传入props、next和stop函数
        const result = callback(props, next, stop);

        // 如果已经调用了stop函数，不继续执行事件链
        if (isStopped) {
          return;
        }

        // 如果回调返回了一个值，处理它
        if (result !== undefined) {
          // 对象类型返回值的特殊处理
          if (typeof result === "object" && result !== null) {
            // 使用返回对象作为下一个事件的参数
            next(result);
          } else {
            // 非对象返回值，包装成对象传递
            next({ value: result, prev: props });
          }
        } else {
          // 没有返回值，使用原始props调用next
          next(props);
        }
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
        // 如果没有显式停止，出错时也继续事件链，避免整个链被中断
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
   * 向事件链中添加一个事件
   * @param event 事件名称
   * @param props 事件参数对象
   * @returns 返回this实例,支持链式调用
   */
  public add(event: string, props: Record<string, any> = {}): UIBridge {
    // 添加事件到链中
    this._eventChain.push({ event, props });

    // 如果当前没有正在处理的事件，则启动处理
    if (!this._isProcessing) {
      this._processNextEvent();
    }

    return this;
  }

  /**
   * 向事件链中添加一个延迟
   * @param duration 延迟时间(毫秒)
   * @returns 返回this实例,支持链式调用
   */
  public sleep(duration: number): UIBridge {
    return this.add(SLEEP_EVENT, { duration });
  }

  /**
   * 批量添加事件到事件链
   * @param events 事件数组,每个事件包含事件名和可选的参数
   * @returns 返回this实例
   */
  public batch(events: UIEventBatchItem[]): UIBridge {
    // 清空当前事件链,避免混合
    this.clear();

    events.forEach((item) => {
      if (item.event === "sleep" && item.props?.duration) {
        // 处理特殊的休眠事件
        this.sleep(item.props.duration);
      } else {
        this.add(item.event, item.props || {});
      }
    });

    return this;
  }

  /**
   * 清空事件链
   */
  public clear(): UIBridge {
    this._eventChain = [];
    this._isProcessing = false;
    return this;
  }

  /**
   * 处理事件链中的下一个事件
   * @param prevProps 上一个事件传递的参数
   */
  private _processNextEvent(prevProps: Record<string, any> = {}) {
    // 如果没有更多事件，结束处理
    if (this._eventChain.length === 0) {
      this._isProcessing = false;
      return;
    }

    // 标记为正在处理
    this._isProcessing = true;

    // 获取并移除第一个事件
    const currentEvent = this._eventChain.shift()!;
    const eventProps = {
      ...currentEvent.props,
      prev: prevProps,
    };

    // 检查事件是否有监听器
    if (this._emitter.listenerCount(currentEvent.event) > 0) {
      this._emitter.emit(
        currentEvent.event,
        eventProps,
        (nextProps: Record<string, any> = {}) => {
          // 处理下一个事件
          this._processNextEvent(nextProps);
        }
      );
    } else {
      // 如果没有监听器,直接处理下一个事件
      this._processNextEvent(prevProps);
    }
  }
}

// 导出一个全局单例
export const ui = new UIBridge();
