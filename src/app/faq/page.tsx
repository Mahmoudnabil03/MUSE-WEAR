export default function FAQPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-black">FAQ</h1>
      <div className="mt-6 space-y-4 text-sm">
        {[
          ["Do you support COD?", "Yes — Cash on Delivery across Egypt. Paymob (X-Pay) also available."],
          ["Delivery time?", "Cairo/Alex/Giza 1-2 days, other governorates 2-4 days."],
          ["Returns?", "14 days, unworn with tags. See Returns policy."],
          ["How to track?", "Use Track Order with order number + phone."],
        ].map(([q,a])=>(
          <div key={q} className="bg-white border border-zinc-200 p-4 rounded-xl"><div className="font-bold">{q}</div><div className="text-zinc-600 mt-1">{a}</div></div>
        ))}
      </div>
    </div>
  );
}
