'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/UI/Tabs'
import ShopItems from 'components/Shop/Items'
import PremiumCredits from 'components/Shop/Credits'
import { ShoppingBasket, Backpack } from 'lucide-react'
import { useUser } from 'contexts/UserContext'

const ShopPage: React.FC = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('shop')

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white p-4 md:p-8 mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Boutique de la station Mir
          </h1>
          <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-indigo-500/30">
            <div className="flex items-center">
              <span className="text-indigo-400 mr-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 12l-4 4-4-4M12 8v8" />
                </svg>
              </span>
              <span className="font-medium text-indigo-300">Crédits:</span>
              <span className="ml-2 font-bold text-white">{ user?.credits?.toLocaleString('fr-FR') || 0 }</span>
            </div>
            <div className="h-4 w-px bg-indigo-500/30"></div>
            <div className="flex items-center">
              <span className="text-purple-400 mr-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <span className="font-medium text-purple-300">Premium:</span>
              <span className="ml-2 font-bold text-white">{ user?.premium && new Date(user.premium) > new Date() ? 'Actif' : 'Inactif'}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="shop" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-lg"></div>
            <TabsList className="relative grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg h-14">
              <TabsTrigger
                value="shop"
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-md transition-all"
              >
                <span className="flex items-center">
                  <ShoppingBasket className="h-4 w-4 mr-2" />
                  Boutique d'Items
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-md transition-all"
              >
                <span className="flex items-center">
                  <Backpack className="h-4 w-4 mr-2" />
                  Mon inventaire
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="premium"
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-md transition-all"
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Premium & Crédits
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="shop" className="mt-0">
            <ShopItems inventory={false} />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0">
            <ShopItems inventory={true} />
          </TabsContent>

          <TabsContent value="premium" className="mt-0">
            <PremiumCredits />
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  )
}

export default ShopPage
