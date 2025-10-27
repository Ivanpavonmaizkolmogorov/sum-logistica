import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Card from '../ui/Card';

const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const event = e.touches ? e.touches[0] : e;
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault(); // Evitar scroll en móvil
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); // Reset path
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Ajustar al tamaño del contenedor
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    // Eventos de ratón
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Eventos táctiles
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative flex flex-col">
        <button onClick={onCancel} className="absolute top-4 right-4"><X size={24} /></button>
        <h3 className="text-2xl font-bold mb-4">Firma del Cliente</h3>
        <canvas ref={canvasRef} className="bg-gray-700 rounded-lg w-full h-48 cursor-crosshair touch-none"></canvas>
        <div className="flex justify-between mt-4 space-x-2">
          <button onClick={clearCanvas} className="flex-1 bg-gray-600 py-2 px-4 rounded-lg">Limpiar</button>
          <button onClick={() => { onSave(canvasRef.current.toDataURL()); }} className="flex-1 bg-blue-600 py-2 px-4 rounded-lg">Guardar</button>
        </div>
      </Card>
    </div>
  );
};

export default SignaturePad;