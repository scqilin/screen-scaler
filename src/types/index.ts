/**
 * 缩放模式类型
 */
export type ScaleMode = 'none' | 'auto' | 'width' | 'height' | 'stretch';

/**
 * 缩放信息接口
 */
export interface ScaleInfo {
  mode: ScaleMode;
  scale: {
    x: number;
    y: number;
    ratio: number; // 等比缩放时的缩放比例
  };
  screen: {
    width: number;
    height: number;
  };
  design: {
    width: number;
    height: number;
  };
  scaled: {
    width: number;
    height: number;
  };
  offset: {
    x: number;
    y: number;
  };
}

/**
 * 配置接口
 */
export interface ScreenScalerConfig {
  /** 容器元素或选择器 */
  container: HTMLElement | string;
  /** 设计稿宽度 */
  designWidth: number;
  /** 设计稿高度 */
  designHeight: number;
  /** 缩放模式 */
  mode?: ScaleMode;
  /** 是否自动响应窗口变化 */
  autoResize?: boolean;
  /** 缩放变化回调 */
  onScaleChange?: (info: ScaleInfo) => void;
}
