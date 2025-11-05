import { Button } from './ui/button';
import { X, MessageSquare, ShoppingCart, Mail } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Product } from '../App';

type SitePreviewProps = {
  siteName: string;
  description: string;
  primaryColor: string;
  fontFamily: string;
  contact: string;
  products: Product[];
  onClose: () => void;
};

export function SitePreview({
  siteName,
  description,
  primaryColor,
  fontFamily,
  contact,
  products,
  onClose,
}: SitePreviewProps) {
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?', isUser: false }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages([...chatMessages, { text: chatInput, isUser: true }]);
    
    // Simulate chatbot response based on catalog
    setTimeout(() => {
      let response = 'Je suis là pour vous aider avec nos produits !';
      
      if (chatInput.toLowerCase().includes('prix') || chatInput.toLowerCase().includes('combien')) {
        if (products.length > 0) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          response = `Le ${randomProduct.name} coûte ${randomProduct.price}€. Puis-je vous aider avec autre chose ?`;
        }
      } else if (chatInput.toLowerCase().includes('stock') || chatInput.toLowerCase().includes('disponible')) {
        if (products.length > 0) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          response = `Nous avons ${randomProduct.stock} unités de ${randomProduct.name} en stock.`;
        }
      } else if (chatInput.toLowerCase().includes('produit') || chatInput.toLowerCase().includes('catalogue')) {
        response = `Nous avons ${products.length} produits dans notre catalogue. Que cherchez-vous exactement ?`;
      }
      
      setChatMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 500);
    
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto" style={{ fontFamily }}>
      {/* Preview Header */}
      <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Aperçu du site</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">{siteName}.shanify.com</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-slate-800">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Site Header */}
      <header className="border-b border-slate-200" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-white">{siteName}</h1>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4" style={{ backgroundColor: `${primaryColor}10` }}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-slate-900 mb-4">Bienvenue sur {siteName}</h2>
          <p className="text-slate-600 text-xl max-w-3xl mx-auto">
            {description}
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-slate-900 mb-8 text-center">Nos produits</h2>
          
          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Aucun produit dans le catalogue pour le moment
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-slate-100">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-slate-900 mb-2">{product.name}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900">
                        {product.price.toFixed(2)} €
                      </span>
                      <Button 
                        size="sm"
                        style={{ backgroundColor: primaryColor }}
                        className="text-white hover:opacity-90"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-slate-900 mb-4">Nous contacter</h2>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Mail className="w-5 h-5" />
            <a href={`mailto:${contact}`} className="hover:underline">
              {contact}
            </a>
          </div>
        </div>
      </section>

      {/* Chatbot Button */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
        style={{ backgroundColor: primaryColor }}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chatbot Window */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
            <h3 className="text-white">Assistant Shanify</h3>
            <button onClick={() => setShowChatbot(false)} className="text-white hover:bg-white/10 rounded p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-slate-900"
              />
              <Button 
                onClick={handleSendMessage}
                style={{ backgroundColor: primaryColor }}
                className="text-white"
              >
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
