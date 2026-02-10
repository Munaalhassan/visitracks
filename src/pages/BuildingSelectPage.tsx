import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useBuilding } from '@/contexts/BuildingContext';
import { Building } from '@/types/visitor';

export default function BuildingSelectPage() {
  const navigate = useNavigate();
  const { buildings, verifyBuildingCode, setCurrentBuilding, isLoading } = useBuilding();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [dialogCode, setDialogCode] = useState('');
  const [dialogError, setDialogError] = useState('');

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setDialogCode('');
    setDialogError('');
  };

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;

    if (dialogCode.toLowerCase() === selectedBuilding.code.toLowerCase()) {
      setCurrentBuilding(selectedBuilding);
      setSelectedBuilding(null);
      navigate('/');
    } else {
      setDialogError('Invalid access code. Please try again.');
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const building = verifyBuildingCode(accessCode);
    if (building) {
      setCurrentBuilding(building);
      navigate('/');
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Building2 className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Building2 className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">VisiTrack</h1>
          </div>
          <p className="text-muted-foreground text-lg">Visitor Management System</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {buildings.map((building) => (
            <Card
              key={building.id}
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
              onClick={() => handleBuildingClick(building)}
            >
              <CardHeader className="text-center pb-2">
                <Building2 className="h-10 w-10 mx-auto text-primary" />
                <CardTitle className="text-xl">{building.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>{building.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Enter Access Code
            </CardTitle>
            <CardDescription>Enter your building access code to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value); setError(''); }}
                  className="flex-1"
                />
                <Button type="submit">Access</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Access Code Dialog */}
      <Dialog open={!!selectedBuilding} onOpenChange={(open) => !open && setSelectedBuilding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Access {selectedBuilding?.name}
            </DialogTitle>
            <DialogDescription>
              Enter the access code for {selectedBuilding?.name} to continue
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDialogSubmit} className="space-y-4">
            {dialogError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{dialogError}</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              placeholder="Enter access code"
              value={dialogCode}
              onChange={(e) => { setDialogCode(e.target.value); setDialogError(''); }}
              autoFocus
            />
            <Button type="submit" className="w-full">Unlock</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
