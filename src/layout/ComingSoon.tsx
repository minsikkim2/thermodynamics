export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">이 탭은 준비 중입니다.</p>
    </div>
  )
}
