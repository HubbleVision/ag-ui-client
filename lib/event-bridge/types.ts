import { EventEmitter } from "eventemitter3";
import { ReactNode } from "react";

export type ContextItem = {
  id: string;
  name: string;
  data: any;
  from: string;
  role?: "system";
  once?: boolean;
  type: string;
  title?: string;
  content?: ReactNode | string;
};

export type Context = ContextItem[];

export type UIEventHandler = (
  props: Record<string, any>,
  next: (nextProps?: Record<string, any>) => void
) => void;

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
