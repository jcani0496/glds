import { useEffect, useState } from 'react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function Featured(){
  const [items, setItems] = useState([]);
  useEffect(()=>{ (async()=>{
    const { data } = await api.get('/products?featured=1');
    setItems(data);
  })(); },[]);
  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold mb-6">Productos Destacados</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(p => <ProductCard key={p.id} p={p}/>) }
      </div>
    </section>
  )
}
