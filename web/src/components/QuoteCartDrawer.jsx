import { useCart } from '../lib/store.jsx';
import { API } from '../lib/api';
import { useState } from 'react';

export default function QuoteCartDrawer(){
  const { state, dispatch } = useCart();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', notes:'' });

  async function sendQuote(){
    if (!form.name || !form.email || state.items.length===0) return alert('Completa tus datos y agrega productos');
    setSending(true);
    try{
      const payload = {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        notes: form.notes,
        items: state.items.map(i=>({ product_id: i.product_id, product_name: i.product_name, sku: i.sku, qty: i.qty }))
      };
      const { data } = await API.post('/quotes', payload);
      alert(`Cotización enviada. Código: ${data.code}`);
      dispatch({ type:'clear' });
      dispatch({ type:'close' });
    }catch(e){
      alert('Error al enviar la cotización');
    }finally{ setSending(false); }
  }

  return (
    <div className={`fixed top-0 right-0 h-full w-[360px] bg-black/90 border-l border-white/10 p-4 transition-transform ${state.open?'translate-x-0':'translate-x-full'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Tu cotización</h3>
        <button onClick={()=>dispatch({type:'close'})} className="text-white/60 hover:text-white">✕</button>
      </div>
      <div className="space-y-3 overflow-auto h-[45%] pr-2">
        {state.items.map((it,idx)=> (
          <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
            <div>
              <div className="font-medium text-sm">{it.product_name}</div>
              <div className="text-xs text-white/60">SKU {it.sku||'-'} · Cant. {it.qty}</div>
            </div>
            <button onClick={()=>dispatch({type:'remove', index: idx})} className="text-xs text-red-300">Eliminar</button>
          </div>
        ))}
        {state.items.length===0 && <div className="text-sm text-white/60">No has agregado productos.</div>}
      </div>

      <div className="mt-4 space-y-2">
        <input className="w-full bg-white/10 rounded-lg px-3 py-2" placeholder="Tu nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="w-full bg-white/10 rounded-lg px-3 py-2" placeholder="Tu email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="w-full bg-white/10 rounded-lg px-3 py-2" placeholder="Tu teléfono (opcional)" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
        <textarea className="w-full bg-white/10 rounded-lg px-3 py-2" rows="3" placeholder="Notas (colores, marcaje, etc.)" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}></textarea>
        <button disabled={sending} onClick={sendQuote}
          className="w-full py-2 rounded-lg bg-glds.primary hover:bg-glds.primaryDark text-black font-semibold">
          {sending? 'Enviando…' : 'Enviar cotización'}
        </button>
      </div>
    </div>
  )
}
