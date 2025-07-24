import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Download,
  Star
} from 'lucide-react';

export const ResourcesSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const resources = [
    {
      id: 1,
      title: 'Si të shkruash një ide të qartë',
      description: 'Udhëzime hap pas hapi për të formuluar idenë tuaj',
      type: 'guide',
      icon: FileText,
      badge: 'PDF',
      popular: true
    },
    {
      id: 2,
      title: 'Shembuj nga vitet e kaluara',
      description: 'Projekte fituese dhe arsyet e suksesit të tyre',
      type: 'examples',
      icon: Star,
      badge: 'Galeria',
      popular: true
    },
    {
      id: 3,
      title: 'Si të prezantosh një prototip',
      description: 'Video udhëzuese për prezantime efektive',
      type: 'video',
      icon: Video,
      badge: 'Video'
    },
    {
      id: 4,
      title: 'Template për përshkrim projekti',
      description: 'Shablon i gatshëm për të strukturuar idenë',
      type: 'template',
      icon: Download,
      badge: 'DOC'
    },
    {
      id: 5,
      title: 'Këshilla nga mentorët',
      description: 'Këshilla praktike nga ekspertë të industrisë',
      type: 'tips',
      icon: Lightbulb,
      badge: 'Artikull'
    }
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'guide': return 'text-primary';
      case 'examples': return 'text-accent';
      case 'video': return 'text-blue-600';
      case 'template': return 'text-green-600';
      case 'tips': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'guide': return 'status-ri';
      case 'examples': return 'status-miratuar';
      case 'video': return 'status-shqyrtim';
      default: return 'secondary';
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Collapsible */}
      <div className="lg:hidden mb-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-12 text-base"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                📘 Këshilla dhe Inspirim
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <ResourcesContent resources={resources} getIconColor={getIconColor} getBadgeVariant={getBadgeVariant} />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <Card className="institutional-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                📘 Këshilla dhe Inspirim
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResourcesContent resources={resources} getIconColor={getIconColor} getBadgeVariant={getBadgeVariant} />
            </CardContent>
          </Card>

          {/* Motivational Quote */}
          <Card className="institutional-card mt-6 bg-gradient-to-br from-accent/5 to-primary/5">
            <CardContent className="p-6 text-center">
              <Lightbulb className="mx-auto h-8 w-8 text-accent mb-3" />
              <blockquote className="text-sm italic text-muted-foreground mb-2">
                "Çdo ide e madhe filloi si një ide e vogël në mendjen e dikujt."
              </blockquote>
              <p className="text-xs text-muted-foreground">— Anonym</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ResourcesContent = ({ 
  resources, 
  getIconColor, 
  getBadgeVariant 
}: { 
  resources: any[], 
  getIconColor: (type: string) => string,
  getBadgeVariant: (type: string) => string 
}) => {
  return (
    <div className="space-y-3">
      {resources.map((resource) => {
        const IconComponent = resource.icon;
        return (
          <div
            key={resource.id}
            className="group p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-all duration-200 cursor-pointer hover:bg-accent/5"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-muted/50 ${getIconColor(resource.type)}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                    {resource.title}
                    {resource.popular && (
                      <span className="ml-1 text-accent">⭐</span>
                    )}
                  </h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs status-badge ${getBadgeVariant(resource.type)} flex-shrink-0`}
                  >
                    {resource.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {resource.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-accent group-hover:text-accent/80 transition-colors">
                  <span>Shiko resursin</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <h5 className="font-medium text-sm text-primary mb-2">💡 Këshilla të shpejta</h5>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Fokusohuni në problemin që zgjidhni</li>
          <li>• Tregoni se si ideja juaj është unike</li>
          <li>• Shtoni dëshmi vizuale (foto, video)</li>
          <li>• Mendoni për ndikimin në komunitet</li>
        </ul>
      </div>
    </div>
  );
};