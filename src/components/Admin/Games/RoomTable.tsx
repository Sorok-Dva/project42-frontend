'use client'

import React, { useState } from 'react'
import { Button } from 'components/UI/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/UI/DropdownMenu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/UI/Table'
import type { RoomAttributes } from 'types/room'
import { MoreHorizontal, Play, Shield, Trash } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'components/UI/Dialog'
import { Badge } from 'components/UI/Badge'
import { Input } from 'components/UI/Input'
import { Label } from 'components/UI/Label'
import { roomTypes } from 'data/mock-rooms'

interface RoomsTableProps {
  rooms: RoomAttributes[]
}

const RoomsTable: React.FC<RoomsTableProps> = ({ rooms: initialRooms }) => {
  const [rooms, setRooms] = useState<RoomAttributes[]>(initialRooms)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<number | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomAttributes | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)

  // Filtrer les parties
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.creator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? room.status === statusFilter : true
    const matchesType = typeFilter ? room.type === typeFilter : true
    return matchesSearch && matchesStatus && matchesType
  })

  // Gérer la suppression d'une partie
  const handleDelete = () => {
    if (selectedRoom) {
      setRooms(rooms.filter((room) => room.id !== selectedRoom.id))
      setShowDeleteDialog(false)
      setSelectedRoom(null)
    }
  }

  // Gérer l'arrêt d'une partie
  const handleStop = (room: RoomAttributes) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === room.id) {
          return { ...r, status: 'completed' as const }
        }
        return r
      }),
    )
  }

  // Gérer la connexion à une partie
  const handleJoin = () => {
    setShowJoinDialog(false)
    setSelectedRoom(null)
    // Logique pour rejoindre la partie
  }

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'waiting':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            En attente
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
            En cours
        </Badge>
      )
    case 'completed':
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Terminée
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
    }
  }

  // Obtenir le nom du type de partie
  const getRoomTypeName = (typeId: number) => {
    const type = roomTypes.find((t) => t.id === typeId)
    return type ? type.name : `Type ${typeId}`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des parties</CardTitle>
          <CardDescription>
            Gérez toutes les parties du jeu, consultez leur statut et effectuez des actions rapides.
          </CardDescription>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Rechercher par nom ou créateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Statut</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>Tous</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('waiting')}>En attente</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>En cours</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Terminées</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Type</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTypeFilter(null)}>Tous</DropdownMenuItem>
                  {roomTypes.map((type) => (
                    <DropdownMenuItem key={type.id} onClick={() => setTypeFilter(type.id)}>
                      {type.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Créateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Joueurs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Options</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Aucune partie trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{room.creator}</TableCell>
                    <TableCell>{getRoomTypeName(room.type)}</TableCell>
                    <TableCell>
                      {room.players?.length || 0}/{room.maxPlayers}
                    </TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell>{room.createdAt?.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {room.privateGame && <Badge variant="secondary">Privée</Badge>}
                        {room.anonymousVotes && <Badge variant="secondary">Votes anonymes</Badge>}
                        {room.anonymousGame && <Badge variant="secondary">Anonyme</Badge>}
                        {room.pointsMultiplier > 1 && (
                          <Badge variant="secondary">x{room.pointsMultiplier} points</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRoom(room)
                              setShowJoinDialog(true)
                            }}
                            disabled={room.status === 'completed'}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Rejoindre
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStop(room)} disabled={room.status !== 'in_progress'}>
                            <Shield className="mr-2 h-4 w-4" />
                            Arrêter
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRoom(room)
                              setShowDeleteDialog(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la partie "{selectedRoom?.name}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour rejoindre une partie */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejoindre la partie</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejoindre la partie "{selectedRoom?.name}".
              {selectedRoom?.privateGame && ' Cette partie est privée et nécessite un mot de passe.'}
            </DialogDescription>
          </DialogHeader>
          {selectedRoom?.privateGame && selectedRoom?.password && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Mot de passe
                </Label>
                <Input id="password" type="password" className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleJoin}>Rejoindre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RoomsTable
