import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Store, Palette, MessageSquare, Zap, Globe, BarChart3 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { User } from '../App';

type LandingPageProps = {
  onGetStarted: () => void;
  user: User | null;
};

export function LandingPage({ onGetStarted, user }: LandingPageProps) {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-slate-50">
                Créez votre boutique en ligne en quelques minutes
              </h1>
              <p className="text-blue-100 text-xl">
                Shanify vous permet de construire, personnaliser et gérer votre site e-commerce 
                avec un chatbot IA intégré pour améliorer l'expérience client.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Commencer gratuitement
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Voir la démo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1635405111186-9917e36e4a40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwYnVpbGRlciUyMGRlc2lnbnxlbnwxfHx8fDE3NjIxNzA3Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Website builder interface"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-slate-900 mb-4">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto">
              Une plateforme complète pour créer et gérer votre boutique en ligne
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-slate-900">Personnalisation complète</h3>
                <p className="text-slate-600">
                  Personnalisez les couleurs, polices et mise en page de votre site 
                  pour refléter votre marque.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-slate-900">Gestion de catalogue</h3>
                <p className="text-slate-600">
                  Ajoutez et gérez vos produits facilement avec support des variantes, 
                  catégories et stock.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-slate-900">Chatbot IA intégré</h3>
                <p className="text-slate-600">
                  Un chatbot intelligent basé sur votre catalogue pour répondre 
                  automatiquement aux questions clients.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-slate-900">Déploiement instantané</h3>
                <p className="text-slate-600">
                  Votre site est en ligne immédiatement avec une URL unique 
                  dès sa création.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-slate-900">Sites optimisés</h3>
                <p className="text-slate-600">
                  Sites rapides, responsives et optimisés pour tous les appareils 
                  et moteurs de recherche.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-slate-900">Interface intuitive</h3>
                <p className="text-slate-600">
                  Builder simple et puissant, aucune compétence technique 
                  requise pour créer votre site.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-slate-50">
            Prêt à lancer votre boutique en ligne ?
          </h2>
          <p className="text-blue-100 text-xl">
            Rejoignez des milliers d'entrepreneurs qui font confiance à Shanify
          </p>
          <Button 
            size="lg"
            onClick={onGetStarted}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Créer mon site gratuitement
          </Button>
        </div>
      </section>
    </div>
  );
}
