import type { ScaleMode, ScaleInfo, ScreenScalerConfig } from '../types';

/**
 * 大屏缩放适配器 - TypeScript版本
 *
 * 支持五种缩放模式：
 * - none: 默认模式，不做任何缩放处理
 * - auto: 等比缩放，保持宽高比不变
 * - width: 宽度适配，根据屏幕宽度等比缩放
 * - height: 高度适配，根据屏幕高度等比缩放
 * - stretch: 拉伸适配，分别缩放宽高以填满屏幕
 *
 * 特点：
 * - 支持任意设计尺寸，通用性强
 * - 自动处理窗口变化事件
 * - 智能居中和滚动条控制
 * - 提供详细的缩放信息回调
 * - 内存安全，支持销毁和重新初始化
 */

/**
 * 获取页面的滚动条宽度
 * @returns
 */
function getScrollbarWidth() {
  const scrollDiv = document.createElement('div');
  scrollDiv.style.cssText =
    'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}

// 样式类名前缀
const CSS_PREFIX = 'screen-scaler';
let scrollbarWidth = getScrollbarWidth() + 1;

export class ScreenScaler {
  private container: HTMLElement; // 用户传入的容器
  private wrapperContainer!: HTMLElement; // 自动创建的包裹容器
  private parentContainer!: HTMLElement; // 父级容器（用于监听尺寸）
  private config: Required<ScreenScalerConfig>;
  private resizeHandler: () => void;
  private rafId: number | null = null;
  private isDestroyed = false;

  constructor(config: ScreenScalerConfig) {
    // 参数验证
    this.validateConfig(config);

    // 初始化用户容器
    const userContainer = typeof config.container === 'string' ? (document.querySelector(config.container) as HTMLElement) : config.container;

    if (!userContainer) {
      throw new Error('Container element not found');
    }

    this.container = userContainer;

    // 创建包裹容器和设置父级容器
    this.setupContainerStructure();

    // 设置默认配置
    this.config = {
      container: this.container,
      designWidth: config.designWidth,
      designHeight: config.designHeight,
      mode: config.mode || 'auto',
      autoResize: config.autoResize !== false,
      onScaleChange: config.onScaleChange || (() => {}),
    };

    // 绑定resize事件处理器
    this.resizeHandler = this.handleResize.bind(this);

    // 初始化
    this.init();
  }

  /**
   * 设置容器结构 - 创建包裹容器
   */
  private setupContainerStructure(): void {
    // 获取用户容器的父级元素
    this.parentContainer = this.container.parentElement || document.body;

    // 创建包裹容器
    this.wrapperContainer = document.createElement('div');
    this.wrapperContainer.className = `${CSS_PREFIX}-wrapper`;

    // 设置包裹容器的基础样式 - 确保没有间隙
    Object.assign(this.wrapperContainer.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
    });

    // 将用户容器插入到包裹容器中
    // 1. 先将包裹容器插入到用户容器的位置
    this.parentContainer.insertBefore(this.wrapperContainer, this.container);
    // 2. 然后将用户容器移动到包裹容器内
    this.wrapperContainer.appendChild(this.container);
  }

  /**
   * 验证配置参数
   */
  private validateConfig(config: ScreenScalerConfig): void {
    if (!config.container) {
      throw new Error('Container is required');
    }
    if (!config.designWidth || config.designWidth <= 0) {
      throw new Error('designWidth must be a positive number');
    }
    if (!config.designHeight || config.designHeight <= 0) {
      throw new Error('designHeight must be a positive number');
    }
  }

  /**
   * 初始化缩放器
   */
  private init(): void {
    // 设置容器初始样式
    this.setupContainerStyles();

    // 绑定事件
    if (this.config.autoResize) {
      this.setupResizeObserver();
    }
    this.handleResize();
  }

  /**
   * 设置ResizeObserver监听包裹容器尺寸变化
   */
  private setupResizeObserver(): void {
    (window as any).addEventListener('resize', this.resizeHandler);
  }

  /**
   * 设置容器基础样式
   */
  private setupContainerStyles(): void {
    const { designWidth, designHeight } = this.config;

    // 设置容器基础样式，确保没有默认间隙
    Object.assign(this.container.style, {
      width: `${designWidth}px`,
      height: `${designHeight}px`,
      transformOrigin: '0 0',
      position: 'relative',
      margin: '0',
      padding: '0',
      border: 'none',
      boxSizing: 'border-box',
    });
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    if (this.isDestroyed) return;
    // 使用 requestAnimationFrame 避免频繁计算
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      // 延迟一小段时间确保DOM完全更新
      setTimeout(() => {
        this.setScale();
      }, 100);
    });
  }

  /**
   * 获取包裹容器的可用尺寸
   */
  private getScreenSize(): { width: number; height: number } {
    // 强制刷新DOM尺寸计算
    void this.wrapperContainer.offsetHeight; // 触发reflow

    // 临时设置overflow: hidden来获取不含滚动条的真实尺寸
    const originalOverflow = this.wrapperContainer.style.overflow;

    this.wrapperContainer.style.overflow = 'hidden';

    // 强制重新计算布局
    void this.wrapperContainer.offsetHeight;

    // 获取真实的容器尺寸（不包含滚动条）
    let width = this.wrapperContainer.clientWidth;
    let height = this.wrapperContainer.clientHeight;

    // 恢复原始的overflow设置
    this.wrapperContainer.style.overflow = originalOverflow;

    // 如果为0，则使用视口尺寸作为后备
    if (width <= 0) {
      width = window.innerWidth;
    }
    if (height <= 0) {
      height = window.innerHeight;
    }

    return { width, height };
  }

  /**
   * 重置所有样式到初始状态
   */
  private resetStyles(): void {
    // 重置用户容器样式
    Object.assign(this.container.style, {
      transform: 'none',
      position: 'relative',
      left: '0px',
      top: '0px',
    });
  }

  /**
   * 获取滚动条宽度
   * @param element 要计算的元素
   * @returns 滚动条宽度
   */
  private getScrollbarSize(element: HTMLElement) {
    return {
      vertical: element.offsetWidth - element.clientWidth,
      horizontal: element.offsetHeight - element.clientHeight,
    };
  }

  /**
   * 默认模式 - 不做任何缩放处理
   */
  private scaleNone(): ScaleInfo {
    const { designWidth, designHeight } = this.config;
    const screen = this.getScreenSize();

    // 先重置所有样式
    this.resetStyles();

    return {
      mode: 'none',
      scale: { x: 1, y: 1, ratio: 1 },
      screen,
      design: { width: designWidth, height: designHeight },
      scaled: { width: designWidth, height: designHeight },
      offset: { x: 0, y: 0 },
    };
  }

  /**
   * 等比缩放模式
   */
  private scaleAuto(): ScaleInfo {
    const { designWidth, designHeight } = this.config;
    const screen = this.getScreenSize();

    // 先重置所有样式
    this.resetStyles();

    const scaleX = screen.width / designWidth;
    const scaleY = screen.height / designHeight;
    const scale = Math.min(scaleX, scaleY);

    // 计算缩放后尺寸和偏移
    const scaledWidth = designWidth * scale;
    const scaledHeight = designHeight * scale;
    const offsetX = (screen.width - scaledWidth) / 2;
    const offsetY = (screen.height - scaledHeight) / 2;

    // 应用缩放和居中
    Object.assign(this.container.style, {
      transform: `scale(${scale})`,
      position: 'absolute',
      left: `${offsetX}px`,
      top: `${offsetY}px`,
    });

    return {
      mode: 'auto',
      scale: { x: scale, y: scale, ratio: scale },
      screen,
      design: { width: designWidth, height: designHeight },
      scaled: { width: scaledWidth, height: scaledHeight },
      offset: { x: offsetX, y: offsetY },
    };
  }

  /**
   * 宽度适配模式
   */
  private scaleWidth(): ScaleInfo {
    const { designWidth, designHeight } = this.config;

    // 先重置所有样式
    this.resetStyles();

    // 获取包裹容器的可用尺寸
    const screen = this.getScreenSize();
    let _w = screen.width;
    if (designWidth / designHeight < (screen.width) / screen.height) {
       _w -= scrollbarWidth;
    }

    const scale = _w / designWidth;
    const scaledWidth = designWidth * scale;
    const scaledHeight = designHeight * scale;

    // 应用缩放
    this.container.style.transform = `scale(${scale})`;

    const offsetX = 0;
    let offsetY = 0;
    // 智能居中和滚动处理
    if (scaledHeight <= screen.height) {
      // 缩放后高度小于屏幕高度，垂直居中
      offsetY = Math.floor((screen.height - scaledHeight) / 2);
      Object.assign(this.container.style, {
        position: 'absolute',
        left: '0px',
        top: `${offsetY}px`,
      });
    } else {
      // 缩放后高度大于屏幕高度，允许垂直滚动
      Object.assign(this.container.style, {
        position: 'relative',
        left: '0px',
        top: '0px',
      });
    }

    return {
      mode: 'width',
      scale: { x: scale, y: scale, ratio: scale },
      screen,
      design: { width: designWidth, height: designHeight },
      scaled: { width: scaledWidth, height: scaledHeight },
      offset: { x: offsetX, y: offsetY },
    };
  }

  /**
   * 高度适配模式
   */
  private scaleHeight(): ScaleInfo {
    const { designWidth, designHeight } = this.config;

    // 先重置所有样式
    this.resetStyles();

    // 获取包裹容器的可用尺寸
    const screen = this.getScreenSize();
    let _h = screen.height;
    if (designWidth / designHeight > screen.width / screen.height) {
      _h -= scrollbarWidth;
    }

    // 高度适配：按照包裹容器高度进行等比缩放
    const scale = _h / designHeight;
    const scaledWidth = designWidth * scale;
    const scaledHeight = designHeight * scale;

    // 应用缩放
    this.container.style.transform = `scale(${scale})`;

    let offsetX = 0;
    const offsetY = 0;
    // 智能居中和滚动处理
    if (scaledWidth <= screen.width) {
      // 缩放后宽度小于屏幕宽度，水平居中
      offsetX = Math.floor((screen.width - scaledWidth) / 2);
      Object.assign(this.container.style, {
        position: 'absolute',
        left: `${offsetX}px`,
        top: '0px',
      });
    } else {
      // 缩放后宽度大于屏幕宽度，允许水平滚动
      Object.assign(this.container.style, {
        position: 'relative',
        left: '0px',
        top: '0px',
      });
    }

    return {
      mode: 'height',
      scale: { x: scale, y: scale, ratio: scale },
      screen,
      design: { width: designWidth, height: designHeight },
      scaled: { width: scaledWidth, height: scaledHeight },
      offset: { x: offsetX, y: offsetY },
    };
  }

  /**
   * 拉伸适配模式
   */
  private scaleStretch(): ScaleInfo {
    const { designWidth, designHeight } = this.config;
    const screen = this.getScreenSize();

    // 先重置所有样式
    this.resetStyles();

    const scaleX = screen.width / designWidth;
    const scaleY = screen.height / designHeight;

    // 应用不同比例的缩放
    Object.assign(this.container.style, {
      transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
      position: 'absolute',
      left: '0px',
      top: '0px',
    });

    // 拉伸模式强制隐藏滚动条，确保完全铺满
    this.wrapperContainer.style.overflow = 'hidden';

    return {
      mode: 'stretch',
      scale: { x: scaleX, y: scaleY, ratio: Math.min(scaleX, scaleY) },
      screen,
      design: { width: designWidth, height: designHeight },
      scaled: { width: screen.width, height: screen.height },
      offset: { x: 0, y: 0 },
    };
  }

  /**
   * 执行缩放
   */
  public setScale(): ScaleInfo {
    if (this.isDestroyed) {
      throw new Error('ScreenScaler has been destroyed');
    }

    let scaleInfo: ScaleInfo;

    switch (this.config.mode) {
      case 'none':
        scaleInfo = this.scaleNone();
        break;
      case 'auto':
        scaleInfo = this.scaleAuto();
        break;
      case 'width':
        scaleInfo = this.scaleWidth();
        break;
      case 'height':
        scaleInfo = this.scaleHeight();
        break;
      case 'stretch':
        scaleInfo = this.scaleStretch();
        break;
      default:
        throw new Error(`Unknown scale mode: ${this.config.mode}`);
    }

    // 触发回调
    this.config.onScaleChange(scaleInfo);

    return scaleInfo;
  }

  /**
   * 设置缩放模式
   */
  public setMode(mode: ScaleMode): ScaleInfo {
    if (this.isDestroyed) {
      throw new Error('ScreenScaler has been destroyed');
    }

    this.config.mode = mode;
    return this.setScale();
  }

  /**
   * 获取当前缩放模式
   */
  public getMode(): ScaleMode {
    return this.config.mode;
  }

  /**
   * 获取当前缩放信息
   */
  public getScaleInfo(): ScaleInfo {
    return this.setScale();
  }

  /**
   * 更新设计尺寸
   */
  public updateDesignSize(width: number, height: number): ScaleInfo {
    if (this.isDestroyed) {
      throw new Error('ScreenScaler has been destroyed');
    }

    this.config.designWidth = width;
    this.config.designHeight = height;
    this.setupContainerStyles();
    return this.setScale();
  }

  /**
   * 启用/禁用自动resize
   */
  public setAutoResize(enabled: boolean): void {
    if (this.isDestroyed) {
      throw new Error('ScreenScaler has been destroyed');
    }

    if (enabled && !this.config.autoResize) {
      this.setupResizeObserver();
    } else if (!enabled && this.config.autoResize) {
      (window as any).removeEventListener('resize', this.resizeHandler);
    }

    this.config.autoResize = enabled;
  }

  /**
   * 设置缩放变化回调
   */
  public setOnScaleChange(callback: (info: ScaleInfo) => void): void {
    this.config.onScaleChange = callback;
  }

  /**
   * 销毁缩放器
   */
  public destroy(): void {
    if (this.isDestroyed) return;

    // 取消resize事件监听
    (window as any).removeEventListener('resize', this.resizeHandler);

    // 取消待执行的动画帧
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // 重置用户容器样式
    Object.assign(this.container.style, {
      transform: '',
      position: '',
      left: '',
      top: '',
      width: '',
      height: '',
    });

    // 恢复容器的原始位置结构
    if (this.wrapperContainer && this.wrapperContainer.parentElement) {
      // 将用户容器移回到包裹容器的位置
      this.wrapperContainer.parentElement.insertBefore(this.container, this.wrapperContainer);
      // 移除包裹容器
      this.wrapperContainer.remove();
    }

    // 标记为已销毁
    this.isDestroyed = true;
  }

  /**
   * 检查是否已销毁
   */
  public isDestroyed_(): boolean {
    return this.isDestroyed;
  }
}
