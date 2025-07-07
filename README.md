# @scqilin/screen-scaler

一个强大的大屏缩放适配器，专为大屏应用开发设计。支持多种缩放模式，提供完整的 TypeScript 类型支持。

## ✨ 特性

- 🎯 **多种缩放模式**: 支持自动、宽度、高度、拉伸、无缩放五种模式
- 📱 **响应式设计**: 自动响应窗口大小变化
- 🎨 **设计稿适配**: 支持任意设计稿尺寸
- 💪 **TypeScript**: 完整的类型定义支持
- 🚀 **轻量级**: 无依赖，压缩后小于 10KB
- 🔧 **易于使用**: 简单的 API 设计
- 🎛️ **灵活配置**: 丰富的配置选项
- 📊 **实时信息**: 提供详细的缩放信息回调

## 📦 安装

```bash
npm install @scqilin/screen-scaler
```

```bash
yarn add @scqilin/screen-scaler
```

```bash
pnpm add @scqilin/screen-scaler
```

## 🚀 快速开始

### ES Module

```typescript
import { ScreenScaler } from '@scqilin/screen-scaler';

const scaler = new ScreenScaler({
  container: '#app',
  designWidth: 1920,
  designHeight: 1080,
  mode: 'auto'
});
```

### CommonJS

```javascript
const { ScreenScaler } = require('@scqilin/screen-scaler');

const scaler = new ScreenScaler({
  container: document.getElementById('app'),
  designWidth: 1920,
  designHeight: 1080,
  mode: 'auto'
});
```

### UMD (浏览器)

```html
<script src="https://unpkg.com/@scqilin/screen-scaler/dist/index.umd.js"></script>
<script>
  const scaler = new ScreenScaler.ScreenScaler({
    container: '#app',
    designWidth: 1920,
    designHeight: 1080,
    mode: 'auto'
  });
</script>
```

## 📖 API 文档

### 构造函数

```typescript
new ScreenScaler(config: ScreenScalerConfig)
```

### 配置选项 (ScreenScalerConfig)

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `container` | `HTMLElement \| string` | ✅ | - | 目标容器元素或选择器 |
| `designWidth` | `number` | ✅ | - | 设计稿宽度 |
| `designHeight` | `number` | ✅ | - | 设计稿高度 |
| `mode` | `ScaleMode` | ❌ | `'auto'` | 缩放模式 |
| `autoResize` | `boolean` | ❌ | `true` | 是否自动响应窗口变化 |
| `onScaleChange` | `function` | ❌ | - | 缩放变化回调函数 |

### 缩放模式 (ScaleMode)

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| `'none'` | 不进行缩放 | 原始尺寸显示 |
| `'auto'` | 等比缩放，保持宽高比 | 大多数场景的最佳选择 |
| `'width'` | 根据宽度等比缩放 | 宽度固定，高度自适应 |
| `'height'` | 根据高度等比缩放 | 高度固定，宽度自适应 |
| `'stretch'` | 拉伸填满容器 | 需要填满整个屏幕 |

### 实例方法

#### `getScaleInfo(): ScaleInfo`

获取当前缩放信息。

```typescript
const info = scaler.getScaleInfo();
console.log(info.scale.ratio); // 当前缩放比例
```

#### `updateConfig(config: Partial<ScreenScalerConfig>): void`

更新配置。

```typescript
scaler.updateConfig({
  designWidth: 1600,
  designHeight: 900,
  mode: 'width'
});
```

#### `resize(): void`

手动触发重新缩放。

```typescript
scaler.resize();
```

#### `destroy(): void`

销毁实例，清理事件监听器。

```typescript
scaler.destroy();
```

#### `isDestroyed(): boolean`

检查实例是否已销毁。

```typescript
if (!scaler.isDestroyed()) {
  scaler.resize();
}
```

### 缩放信息 (ScaleInfo)

```typescript
interface ScaleInfo {
  mode: ScaleMode;           // 当前缩放模式
  scale: {
    x: number;               // X轴缩放比例
    y: number;               // Y轴缩放比例
    ratio: number;           // 等比缩放比例
  };
  screen: {
    width: number;           // 屏幕宽度
    height: number;          // 屏幕高度
  };
  design: {
    width: number;           // 设计稿宽度
    height: number;          // 设计稿高度
  };
  scaled: {
    width: number;           // 缩放后宽度
    height: number;          // 缩放后高度
  };
  offset: {
    x: number;               // X轴偏移量
    y: number;               // Y轴偏移量
  };
}
```

## 🌟 使用示例

### 基础用法

```typescript
import { ScreenScaler } from '@scqilin/screen-scaler';

// 创建缩放器实例
const scaler = new ScreenScaler({
  container: '#app',
  designWidth: 1920,
  designHeight: 1080,
  mode: 'auto',
  onScaleChange: (info) => {
    console.log(`当前缩放比例: ${info.scale.ratio}`);
  }
});
```

### Vue 3 集成

```vue
<template>
  <div ref="containerRef" class="screen-container">
    <div class="content">
      <!-- 你的内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ScreenScaler } from '@scqilin/screen-scaler';

const containerRef = ref<HTMLElement>();
let scaler: ScreenScaler | null = null;

onMounted(() => {
  if (containerRef.value) {
    scaler = new ScreenScaler({
      container: containerRef.value.querySelector('.content')!,
      designWidth: 1920,
      designHeight: 1080,
      mode: 'auto'
    });
  }
});

onUnmounted(() => {
  scaler?.destroy();
});
</script>
```

### React 集成

```tsx
import React, { useRef, useEffect } from 'react';
import { ScreenScaler } from '@scqilin/screen-scaler';

const BigScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<ScreenScaler | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      scalerRef.current = new ScreenScaler({
        container: containerRef.current,
        designWidth: 1920,
        designHeight: 1080,
        mode: 'auto'
      });
    }

    return () => {
      scalerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="screen-wrapper">
      <div ref={containerRef} className="screen-content">
        {/* 你的内容 */}
      </div>
    </div>
  );
};
```

### 动态配置

```typescript
import { ScreenScaler } from '@scqilin/screen-scaler';

const scaler = new ScreenScaler({
  container: '#app',
  designWidth: 1920,
  designHeight: 1080,
  mode: 'auto'
});

// 响应用户设置
function handleModeChange(mode: 'auto' | 'width' | 'height' | 'stretch' | 'none') {
  scaler.updateConfig({ mode });
}

// 响应设计尺寸变化
function handleSizeChange(width: number, height: number) {
  scaler.updateConfig({ 
    designWidth: width, 
    designHeight: height 
  });
}
```

## 🎯 最佳实践

### 1. 选择合适的缩放模式

- **auto**: 大多数情况下的最佳选择，保持设计稿比例
- **width**: 适用于横向滚动或宽度固定的场景
- **height**: 适用于纵向滚动或高度固定的场景
- **stretch**: 需要填满整个屏幕时使用
- **none**: 调试或特殊需求时使用

### 2. 合理设置设计稿尺寸

```typescript
// 推荐的设计稿尺寸
const commonSizes = {
  fullHD: { width: 1920, height: 1080 },    // 全高清
  ultraWide: { width: 2560, height: 1080 }, // 超宽屏
  fourK: { width: 3840, height: 2160 },     // 4K
  tablet: { width: 1024, height: 768 }      // 平板
};
```

### 3. 性能优化

```typescript
// 在组件销毁时记得清理
const scaler = new ScreenScaler(config);

// 页面卸载前销毁
window.addEventListener('beforeunload', () => {
  scaler.destroy();
});
```

### 4. 错误处理

```typescript
try {
  const scaler = new ScreenScaler({
    container: '#app',
    designWidth: 1920,
    designHeight: 1080
  });
} catch (error) {
  console.error('ScreenScaler 初始化失败:', error);
}
```

### 5. 容器样式注意事项

⚠️ **重要提示**：容器元素的 `border`、`padding` 等样式会影响尺寸计算，可能导致缩放计算错误。

```css
/* ❌ 避免在容器上使用这些样式 */
.container {
  border: 2px solid #ccc;     /* 会影响宽高计算 */
  padding: 20px;              /* 会影响内容区域计算 */
  box-sizing: content-box;     /* 默认盒模型会导致计算偏差 */
}

/* ✅ 推荐的容器样式 */
.container {
  box-sizing: border-box;      /* 使用 border-box 盒模型 */
  /* 或者使用内部元素来添加装饰 */
}

/* ✅ 或者将装饰样式应用到父容器 */
.wrapper {
  border: 2px solid #ccc;
  padding: 20px;
}
.container {
  /* ScreenScaler 的目标容器保持简洁 */
}
```

## 🐛 已知问题

### 滚动条边界计算误差

在某些边界情况下，当内容尺寸介于需要滚动条和不需要滚动条之间时，缩放计算可能存在轻微误差。这通常发生在：

- **高度适配模式**：当缩放后的宽度刚好等于或略大于屏幕宽度时
- **宽度适配模式**：当缩放后的高度刚好等于或略大于屏幕高度时

**影响场景**：
```typescript
// 例如：设计尺寸为 1920x1080，屏幕尺寸为 1920x1000
// 在 height 模式下，缩放后宽度可能刚好触及滚动条临界点
const scaler = new ScreenScaler({
  container: '#app',
  designWidth: 1920,
  designHeight: 1080,
  mode: 'height'  // 可能出现计算误差
});
```

**临时解决方案**：
- 避免使用刚好等于屏幕尺寸的设计稿
- 在边界情况下可以考虑使用 `auto` 模式
- 或者手动调整设计稿尺寸，增加一些缓冲空间

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](./LICENSE)

## 🔗 相关链接

- [GitHub 仓库](https://github.com/scqilin/screen-scaler)
- [NPM 包](https://www.npmjs.com/package/@scqilin/screen-scaler)
- [示例演示](https://scqilin.github.io/screen-scaler/)
