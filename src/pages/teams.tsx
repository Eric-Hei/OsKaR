import React, { useState } from 'react';
import { OkrShell } from '@/components/layout/OkrShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { useUserTeams, useCreateTeam, useDeleteTeam } from '@/hooks/useTeams';
import { useTeamInvitations, useCreateInvitation, useDeleteInvitation } from '@/hooks/useInvitations';
import { useUserNotifications, useMarkUserNotificationAsRead } from '@/hooks/useUserNotifications';
import { useTeamMembers, useUpdateTeamMemberRole, useRemoveTeamMember } from '@/hooks/useTeamMembers';
import { Users, Plus, Mail, Trash2, UserPlus, Bell, Crown, Shield, Eye, UserMinus, Edit2 } from 'lucide-react';
import { TeamRole, InvitationStatus, NotificationType } from '@/types';
import { motion } from 'framer-motion';

export default function TeamsPage() {
  const { user } = useAppStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>(TeamRole.MEMBER);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editingMember, setEditingMember] = useState<{ id: string; currentRole: TeamRole } | null>(null);
  const [newRole, setNewRole] = useState<TeamRole>(TeamRole.MEMBER);

  // Hooks
  const { data: teams, isLoading: teamsLoading } = useUserTeams(user?.id);
  const { data: members } = useTeamMembers(selectedTeamId || undefined);
  const { data: invitations } = useTeamInvitations(selectedTeamId || undefined);
  const { data: notifications } = useUserNotifications(user?.id);
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();
  const createInvitation = useCreateInvitation();
  const deleteInvitation = useDeleteInvitation();
  const markAsRead = useMarkUserNotificationAsRead();
  const updateMemberRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();

  const selectedTeam = teams?.find(t => t.id === selectedTeamId);

  const handleCreateTeam = async () => {
    if (!user || !newTeamName.trim()) return;

    try {
      const team = await createTeam.mutateAsync({
        name: newTeamName,
        description: newTeamDescription,
        ownerId: user.id,
      });
      
      setSelectedTeamId(team.id);
      setShowCreateTeamModal(false);
      setNewTeamName('');
      setNewTeamDescription('');
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipe:', error);
      alert('Erreur lors de la création de l\'équipe');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;

    try {
      await deleteTeam.mutateAsync(teamId);
      if (selectedTeamId === teamId) {
        setSelectedTeamId(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipe:', error);
      alert('Erreur lors de la suppression de l\'équipe');
    }
  };

  const handleInviteMember = async () => {
    if (!user || !selectedTeamId || !inviteEmail.trim()) return;

    try {
      await createInvitation.mutateAsync({
        teamId: selectedTeamId,
        email: inviteEmail,
        role: inviteRole,
        invitedBy: user.id,
        token: crypto.randomUUID(),
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      });

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole(TeamRole.MEMBER);
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error);
      alert('Erreur lors de l\'invitation');
    }
  };

  const handleEditRole = (memberId: string, currentRole: TeamRole) => {
    setEditingMember({ id: memberId, currentRole });
    setNewRole(currentRole);
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!editingMember) return;

    try {
      await updateMemberRole.mutateAsync({
        id: editingMember.id,
        role: newRole,
      });

      setShowEditRoleModal(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Erreur lors de la modification du rôle:', error);
      alert('Erreur lors de la modification du rôle');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!selectedTeamId) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir retirer ${memberName} de l'équipe ?`)) return;

    try {
      await removeMember.mutateAsync({
        id: memberId,
        teamId: selectedTeamId,
      });
    } catch (error) {
      console.error('Erreur lors du retrait du membre:', error);
      alert('Erreur lors du retrait du membre');
    }
  };

  // Vérifier si l'utilisateur peut gérer les membres (OWNER ou ADMIN)
  const canManageMembers = () => {
    if (!user || !selectedTeamId || !members) return false;
    const currentUserMember = members.find(m => m.userId === user.id);
    return currentUserMember?.role === TeamRole.OWNER || currentUserMember?.role === TeamRole.ADMIN;
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case TeamRole.ADMIN:
        return <Shield className="h-4 w-4 text-blue-500" />;
      case TeamRole.MEMBER:
        return <Users className="h-4 w-4 text-green-500" />;
      case TeamRole.VIEWER:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return 'Propriétaire';
      case TeamRole.ADMIN:
        return 'Administrateur';
      case TeamRole.MEMBER:
        return 'Membre';
      case TeamRole.VIEWER:
        return 'Observateur';
    }
  };

  const teamNotifications = notifications?.filter(
    n => n.type === NotificationType.TEAM_INVITATION ||
         n.type === NotificationType.TEAM_MEMBER_JOINED
  );

  if (teamsLoading) {
    return (
      <OkrShell title="Mon Équipe" topbarTitle="Mon Équipe" topbarSubtitle="Gérez vos équipes et collaborateurs">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-muted">Chargement...</div>
        </div>
      </OkrShell>
    );
  }

  return (
    <OkrShell title="Mon Équipe" topbarTitle="Mon Équipe" topbarSubtitle="Gérez vos équipes et collaborateurs">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-teal/10 rounded-lg p-3">
                <Users className="h-6 w-6 text-teal" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy">Mon Équipe</h1>
                <p className="text-muted">
                  Gérez vos équipes et invitez des collaborateurs
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateTeamModal(true)} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Créer une équipe
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des équipes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle>Mes Équipes ({teams?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {teams && teams.length > 0 ? (
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedTeamId === team.id
                            ? 'bg-teal/10 border-teal'
                            : 'bg-white border-line hover:bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{team.name}</p>
                            {team.description && (
                              <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                            )}
                          </div>
                          {team.ownerId === user?.id && (
                            <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Aucune équipe</p>
                    <Button onClick={() => setShowCreateTeamModal(true)} size="sm">
                      Créer votre première équipe
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications d'équipe */}
            {teamNotifications && teamNotifications.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications ({teamNotifications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teamNotifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border ${
                          notif.isRead ? 'bg-white border-line' : 'bg-teal/10 border-teal/40'
                        }`}
                      >
                        <p className="text-sm font-medium text-navy">{notif.title}</p>
                        <p className="text-xs text-muted mt-1">{notif.message}</p>
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead.mutate(notif.id)}
                            className="text-xs text-teal hover:text-teal-dark mt-2"
                          >
                            Marquer comme lu
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Détails de l'équipe sélectionnée */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedTeam ? (
              <div className="space-y-6">
                {/* Informations de l'équipe */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedTeam.name}</CardTitle>
                      {selectedTeam.ownerId === user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTeam(selectedTeam.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{selectedTeam.description || 'Aucune description'}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Créée le {new Date(selectedTeam.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <Button onClick={() => setShowInviteModal(true)} size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Inviter un membre
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Membres de l'équipe */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Membres de l'équipe ({members?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {members && members.length > 0 ? (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getRoleIcon(member.role)}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.userName || member.userEmail || 'Utilisateur inconnu'}
                                  {member.userId === user?.id && (
                                    <span className="ml-2 text-xs text-gray-500">(Vous)</span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {getRoleLabel(member.role)}
                                  {member.userEmail && member.userName && (
                                    <> • {member.userEmail}</>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">
                                Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                              </span>
                              {canManageMembers() && member.userId !== user?.id && member.role !== TeamRole.OWNER && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRole(member.id, member.role)}
                                    title="Modifier le rôle"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(
                                      member.id,
                                      member.userName || member.userEmail || 'ce membre'
                                    )}
                                    title="Retirer de l'équipe"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Aucun membre dans cette équipe</p>
                    )}
                  </CardContent>
                </Card>

                {/* Invitations en attente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Invitations en attente ({invitations?.filter(i => i.status === InvitationStatus.PENDING).length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invitations && invitations.filter(i => i.status === InvitationStatus.PENDING).length > 0 ? (
                      <div className="space-y-2">
                        {invitations
                          .filter(i => i.status === InvitationStatus.PENDING)
                          .map((invitation) => (
                            <div
                              key={invitation.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                {getRoleIcon(invitation.role)}
                                <div>
                                  <p className="font-medium text-gray-900">{invitation.email}</p>
                                  <p className="text-sm text-gray-500">
                                    {getRoleLabel(invitation.role)} • Expire le{' '}
                                    {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteInvitation.mutate(invitation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Aucune invitation en attente</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Sélectionnez une équipe pour voir les détails</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
      {/* Modal Créer une équipe */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Créer une équipe</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'équipe *
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="Ex: Équipe Marketing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  rows={3}
                  placeholder="Décrivez votre équipe..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setNewTeamName('');
                  setNewTeamDescription('');
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || createTeam.isPending}
              >
                Créer
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Inviter un membre */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inviter un membre</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="membre@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                >
                  <option value={TeamRole.VIEWER}>Observateur (lecture seule)</option>
                  <option value={TeamRole.MEMBER}>Membre (lecture et édition)</option>
                  <option value={TeamRole.ADMIN}>Administrateur (gestion complète)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {inviteRole === TeamRole.VIEWER && 'Peut consulter les objectifs de l\'équipe'}
                  {inviteRole === TeamRole.MEMBER && 'Peut créer et modifier les objectifs'}
                  {inviteRole === TeamRole.ADMIN && 'Peut gérer l\'équipe et inviter des membres'}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole(TeamRole.MEMBER);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleInviteMember}
                disabled={!inviteEmail.trim() || createInvitation.isPending}
              >
                Envoyer l'invitation
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Modifier le rôle */}
      {showEditRoleModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier le rôle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau rôle
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as TeamRole)}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                >
                  <option value={TeamRole.VIEWER}>Observateur (lecture seule)</option>
                  <option value={TeamRole.MEMBER}>Membre (lecture et édition)</option>
                  <option value={TeamRole.ADMIN}>Administrateur (gestion complète)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newRole === TeamRole.VIEWER && 'Peut consulter les objectifs de l\'équipe'}
                  {newRole === TeamRole.MEMBER && 'Peut créer et modifier les objectifs'}
                  {newRole === TeamRole.ADMIN && 'Peut gérer l\'équipe et inviter des membres'}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditRoleModal(false);
                  setEditingMember(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateRole}
                disabled={newRole === editingMember.currentRole || updateMemberRole.isPending}
              >
                Modifier
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </OkrShell>
  );
}

