import { test, expect, vi } from 'vitest';
import { getMonorepoProjects } from '../src/getMonorepoProjects.ts';

// 测试根目录检测
test('应正确识别pnpm workspace根目录', () => {
  vi.mock('fs', () => ({
    existsSync: (p) => p.includes('pnpm-workspace.yaml')
  }));

  const { root } = getMonorepoProjects();
  console.log(root)
  expect(root).toMatch(/vite-plugin-monoalias$/);
});

// 测试包列表结构
// test('应包含core包和playground包', () => {
//   vi.mock('fs', () => ({
//     existsSync: (p) => true
//   }));

//   const { packages } = getMonorepoProjects();
  
//   expect(packages).toContainEqual(
//     expect.objectContaining({ name: '@vite-plugin-monoalias/core' })
//   );
//   expect(packages).toContainEqual(
//     expect.objectContaining({ name: 'playground-vue3' })
//   );
// });

// // 测试异常处理
// test('非monorepo项目应抛出异常', () => {
//   vi.mock('fs', () => ({
//     existsSync: () => false
//   }));

//   expect(() => getMonorepoProjects()).toThrow('未找到monorepo根目录');
// });
// test('识别lerna项目', () => {
//   vi.mock('fs', () => ({
//     existsSync: p => p.includes('lerna.json')
//   }));
//   // ...断言逻辑
// });