import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Edit, Trash2, ExternalLink, Globe } from 'lucide-react';
import type { Site } from '../App';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

type DashboardProps = {
  sites: Site[];
  onCreateNew: () => void;
  onEditSite: (siteId: string) => void;
  onDeleteSite: (siteId: string) => void;
};

export function Dashboard({ sites, onCreateNew, onEditSite, onDeleteSite }: DashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 mb-2">Mes sites</h1>
          <p className="text-slate-600">
            Gérez et modifiez vos sites e-commerce
          </p>
        </div>
        <Button 
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau site
        </Button>
      </div>

      {sites.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">Aucun site créé</h3>
            <p className="text-slate-600 mb-6 text-center max-w-md">
              Commencez par créer votre premier site e-commerce. 
              C'est simple et rapide avec notre builder intuitif.
            </p>
            <Button 
              onClick={onCreateNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer mon premier site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="border-slate-200 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: site.primaryColor }}
                  >
                    <span className="text-white text-xl">
                      {site.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-slate-900">{site.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {site.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ExternalLink className="w-4 h-4" />
                    <span className="truncate">
                      {site.url}.shanify.com
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => onEditSite(site.id)}
                      className="flex-1"
                      variant="default"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le site</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{site.name}" ? 
                            Cette action est irréversible et supprimera également tous les produits du catalogue.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteSite(site.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
