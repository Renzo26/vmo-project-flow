import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Team {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  teamId: string;
  role: "solicitante" | "fornecedor";
}

const initialTeams: Team[] = [
  { id: "t1", name: "Equipe Digital" },
  { id: "t2", name: "Equipe Infraestrutura" },
  { id: "t3", name: "Equipe Dados" },
];

const initialUsers: User[] = [
  { id: "u1", name: "Carlos Mendes", email: "carlos@vmo.com", teamId: "t1", role: "solicitante" },
  { id: "u2", name: "Ana Silva", email: "ana@vmo.com", teamId: "t1", role: "solicitante" },
  { id: "u3", name: "Pedro Santos", email: "pedro@vmo.com", teamId: "t2", role: "solicitante" },
];

const Configuracoes = () => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const [newTeamName, setNewTeamName] = useState("");
  const [showTeamDialog, setShowTeamDialog] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserTeam, setNewUserTeam] = useState("");
  const [newUserRole, setNewUserRole] = useState<"solicitante" | "fornecedor">("solicitante");
  const [showUserDialog, setShowUserDialog] = useState(false);

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    setTeams(prev => [...prev, { id: `t${Date.now()}`, name: newTeamName.trim() }]);
    setNewTeamName("");
    setShowTeamDialog(false);
  };

  const removeTeam = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    setUsers(prev => prev.map(u => u.teamId === id ? { ...u, teamId: "" } : u));
  };

  const addUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setUsers(prev => [...prev, {
      id: `u${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      teamId: newUserTeam,
      role: newUserRole,
    }]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserTeam("");
    setShowUserDialog(false);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || "Sem equipe";

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-foreground mb-6">Configurações</h2>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-2">
            <Building2 className="h-4 w-4" /> Equipes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Usuários ({users.length})</h3>
              <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Nome *</Label>
                      <Input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Nome completo" className="mt-1" />
                    </div>
                    <div>
                      <Label>E-mail *</Label>
                      <Input value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="email@vmo.com" className="mt-1" />
                    </div>
                    <div>
                      <Label>Perfil</Label>
                      <Select value={newUserRole} onValueChange={(v: "solicitante" | "fornecedor") => setNewUserRole(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solicitante">Solicitante</SelectItem>
                          <SelectItem value="fornecedor">Fornecedor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Equipe</Label>
                      <Select value={newUserTeam} onValueChange={setNewUserTeam}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addUser} className="w-full">Criar Usuário</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Equipe</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Perfil</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getTeamName(u.teamId)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs capitalize">{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => removeUser(u.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Equipes ({teams.length})</h3>
              <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Nova Equipe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Equipe</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Nome da equipe *</Label>
                      <Input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Ex: Equipe Financeiro" className="mt-1" />
                    </div>
                    <Button onClick={addTeam} className="w-full">Criar Equipe</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Equipe</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Membros</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(t => {
                  const memberCount = users.filter(u => u.teamId === t.id).length;
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{memberCount} membro{memberCount !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => removeTeam(t.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
