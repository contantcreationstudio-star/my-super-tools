export default function AdUnit({ slot }) {
  return (
    <div className="my-8 mx-auto max-w-4xl text-center">
      <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2 block">
        Advertisement
      </span>
      
      {/* Google AdSense Container */}
      <div className="bg-slate-100 border border-slate-200 rounded-lg h-[250px] w-full flex items-center justify-center overflow-hidden">
        {/* Jab AdSense approve ho jaye, tab asli code yahan aayega */}
        <p className="text-slate-400 text-sm">Google Ad Space (Responsive)</p>
      </div>
    </div>
  )
}