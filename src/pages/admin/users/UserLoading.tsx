import React from 'react'
import { Skeleton } from 'components/UI/Skeleton'
import { Card, CardContent, CardHeader } from 'components/UI/Card'

const Loading: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte de profil */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="text-center">
                <Skeleton className="h-6 w-40 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <div className="flex justify-center mt-2 space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-800 w-full" />

            <div className="space-y-4">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
            </div>

            <div className="h-px bg-gray-800 w-full" />

            <div className="space-y-4">
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2 pt-4">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Onglets */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-6">
                {Array(7)
                  .fill(null)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-10 flex-1" />
                  ))}
              </div>

              <div className="space-y-4">
                <Skeleton className="h-[300px] w-full" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-[250px] w-full" />
                  <Skeleton className="h-[250px] w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Loading
