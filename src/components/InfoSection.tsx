import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Lightbulb } from 'lucide-react';

export const InfoSection = () => {
  const [guideOpen, setGuideOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Gjenerata e Inovacionit
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Mirë se vini në platformën Gjenerata e Inovacionit. Këtu mund të dorëzoni idenë tuaj, 
          të njiheni me udhëzimet dhe të bëheni pjesë e gjeneratës që ndryshon të ardhmen.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Shiko Udhëzuesin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Udhëzuesi për Aplikim</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Kriteret e Aplikimit</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Ideja duhet të jetë origjinale dhe inovative</li>
                  <li>• Projekti duhet të ketë potencial për ndikimin në komunitet</li>
                  <li>• Aplikanti duhet të jetë i gatshëm për bashkëpunim</li>
                  <li>• Dokumentacioni duhet të jetë i plotë dhe i qartë</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Këshilla për Sukses</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Përshkruani qartë problemin që zgjidhni</li>
                  <li>• Tregoni se si ideja juaj është e veçantë</li>
                  <li>• Përfshini plane konkrete për implementim</li>
                  <li>• Shtoni materiale mbështetëse (foto, video, prototipe)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Procesi i Vlerësimit</h3>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Faza 1: Shqyrtimi fillestar</h4>
                      <p className="text-sm text-muted-foreground">Kontrollohet përputhja me kriteret bazë</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Faza 2: Vlerësimi i detajuar</h4>
                      <p className="text-sm text-muted-foreground">Ekspertët vlerësojnë inovacionin dhe ndikimin</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Faza 3: Vendimi përfundimtar</h4>
                      <p className="text-sm text-muted-foreground">Përzgjedhja e projekteve fituese</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Mëso më shumë për nismën
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rreth Gjeneratës së Inovacionit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Gjenerata e Inovacionit është një nismë kombëtare që synon të identifikojë, 
                mbështesë dhe zhvillojë idetë më inovative nga të rinjtë shqiptarë.
              </p>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Misioni Ynë</h3>
                <p className="text-muted-foreground">
                  Të krijojmë një platformë ku çdo ide e mirë ka shansin të transformohet 
                  në një projekt të suksesshëm që ndihmon në zhvillimin e vendit.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Çfarë Ofrojmë</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Financim për projekte të përzgjedhura</li>
                  <li>• Mentorship nga ekspertë të industrisë</li>
                  <li>• Lidhje me partnerë strategjikë</li>
                  <li>• Platforma për prezantimin publik</li>
                  <li>• Rrjeti i inovatorëve shqiptarë</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Fushat Prioritare</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Teknologjia dhe digjitalizimi</li>
                  <li>• Mjedisi dhe qëndrueshmëria</li>
                  <li>• Shëndetësia dhe mirëqenia</li>
                  <li>• Arsimi dhe formimi</li>
                  <li>• Turizmi dhe kultura</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};