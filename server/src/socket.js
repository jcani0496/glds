export function setUpSocket(io) {
  io.on('connection', (socket) => {
    // Más adelante podríamos autenticar al admin y unirlo a una room
    socket.on('disconnect', () => {});
  });
}

export function notifyNewQuote(io, payload) {
  io.emit('quote:new', payload); // broadcast simple
}
