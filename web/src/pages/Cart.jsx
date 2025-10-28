import QuoteCartModal from "../components/QuoteCartModal.jsx";

export default function Cart() {
  // Página sencilla que centra el modal en el contenido
  return (
    <main className="min-h-[70vh] flex items-start justify-center pt-10 pb-20">
      <QuoteCartModal />
    </main>
  );
}