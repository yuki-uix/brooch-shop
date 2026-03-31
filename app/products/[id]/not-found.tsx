import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-6xl mb-4">🔍</span>
      <h1 className="text-2xl font-bold mb-2">商品未找到</h1>
      <p className="text-text-secondary mb-6">
        该商品可能已下架或链接无效
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
