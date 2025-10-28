export default function Clients(){
  const logos = ['/placeholder.svg','/placeholder.svg','/placeholder.svg','/placeholder.svg'];
  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold mb-6">Clientes que confían en nosotros</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-80">
        {logos.map((src,i)=> (
          <div key={i} className="bg-white/5 rounded-xl p-6 grid place-items-center">
            <img src={src} alt="Cliente" className="h-10"/>
          </div>
        ))}
      </div>
    </section>
  )
}
