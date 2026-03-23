const { cacheDeletePattern } = require('@/lib/cache');

async function main() {
  try {
    await cacheDeletePattern('risk:workorders:*');
    console.log('✅ 缓存已清除');
  } catch (e) {
    console.error('❌ 清除缓存失败:', e.message);
  }
  process.exit(0);
}

main();
