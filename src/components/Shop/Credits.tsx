'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/UI/Tabs'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Card } from 'components/UI/Card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'components/UI/DropdownMenu'
import { Input } from 'components/UI/Input'
import { CreditPack, PremiumPlan, Transaction } from 'types/shop'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { MessageSquareText } from 'lucide-react'

// Premium benefits
const premiumBenefits = [
  {
    id: 1,
    title: 'Options de jeu Premium',
    description: 'Rendez vos parties plus intéressantes avec des options de jeu comme partie privée, partie anonyme, partie séléctive.',
    icon: 'map',
  },
  {
    id: 2,
    title: 'Tchat Exclusif',
    description: 'Débloquez un tchat dédié aux joueurs premium.',
    icon: 'comment',
  },
  {
    id: 3,
    title: 'Cosmétiques Rares',
    description: 'Accédez à une collection de cosmétiques rares et légendaires pour personnaliser votre profil.',
    icon: 'sparkles',
  },
  {
    id: 4,
    title: 'Bonus de Crédits',
    description: 'Recevez 10% de crédits supplémentaires sur toutes les points gagnés, missions et activités.',
    icon: 'trending-up',
  },
  {
    id: 5,
    title: 'Événements VIP',
    description: 'Participez à des événements exclusifs avec des récompenses spéciales.',
    icon: 'calendar',
  },
  {
    id: 6,
    title: 'Support Prioritaire',
    description: 'Bénéficiez d\'un accès prioritaire à notre équipe de support pour résoudre rapidement vos problèmes.',
    icon: 'headphones',
  },
]

// Helper function to get icon component
const getIcon = (iconName : string) => {
  switch (iconName) {
  case 'comment':
    return <MessageSquareText size={ 16 }/>
  case 'map':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    )
  case 'users':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  case 'sparkles':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 3l1.88 5.76h6.12l-4.94 3.58 1.88 5.76-4.94-3.58-4.94 3.58 1.88-5.76-4.94-3.58h6.12z"/>
      </svg>
    )
  case 'trending-up':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    )
  case 'calendar':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  case 'headphones':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path
          d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    )
  default:
    return null
  }
}

const PremiumCredits : React.FC = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('premium')
  const [creditsPacks, setCreditsPacks] = useState<CreditPack[]>([])
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [giftType, setGiftType] = useState('credits')
  const [giftAmount, setGiftAmount] = useState('500')
  const [giftRecipient, setGiftRecipient] = useState('')

  const handleBuyPremium = async (planId: number, provider: 'stripe' | 'paypal') => {
    if (!token) return
    try {
      const { data } = await axios.post(
        '/api/payments/premium',
        { planId, provider },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.log(e)
    }
  }

  const handleBuyCredits = async (packId: number, provider: 'stripe' | 'paypal') => {
    if (!token) return
    try {
      const { data } = await axios.post(
        '/api/payments/credits',
        { packId, provider },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    async function retrieveShopOffers() {
      try {
        const cpResponse = await axios.get<CreditPack[]>('/api/shop/credits_packs')
        const ppResponse = await axios.get<PremiumPlan[]>('/api/shop/premium_plans')
        const trResponse = await axios.get<Transaction[]>('/api/shop/transactions', { headers: { Authorization: `Bearer ${ token }` } })

        setCreditsPacks(cpResponse.data)
        setPremiumPlans(ppResponse.data)
        setTransactions(trResponse.data)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }

    retrieveShopOffers()
  }, [])

  return (
    <motion.div initial={ { opacity: 0 } } animate={ { opacity: 1 } }
      transition={ { duration: 0.3 } }>
      <Tabs defaultValue="premium" value={ activeTab }
        onValueChange={ setActiveTab } className="w-full">
        <div className="relative mb-6">
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 blur-lg"></div>
          <TabsList
            className="relative grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg h-14">
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
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Premium
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="credits"
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
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 12l-4 4-4-4M12 8v8"/>
                </svg>
                Crédits
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="gift"
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
                  <path d="M20 12v10H4V12"/>
                  <path d="M2 7h20v5H2z"/>
                  <path d="M12 22V7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
                Offrir
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
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
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Transactions
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Premium Tab */ }
        <TabsContent value="premium" className="mt-0 space-y-8">
          {/* Premium Plans */ }
          <div>
            <h2
              className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Abonnements Premium
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              { premiumPlans.map((plan) => (
                <Card
                  key={ plan.id }
                  className={ `overflow-hidden bg-gray-800/50 backdrop-blur-sm border ${
                    plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/20': 'border-indigo-500/30'
                  } transition-all h-full flex flex-col` }
                >
                  { plan.popular && (
                    <div
                      className="bg-purple-500 text-white text-center py-1 font-medium">PLUS
                      POPULAIRE</div>
                  ) }
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-2">{ plan.name }</h3>
                    <div className="flex items-baseline mb-4">
                      <span
                        className="text-3xl font-bold">{ plan.price }€</span>
                      { plan.discount && <Badge
                        className="ml-2 bg-green-500">-{ plan.discount }</Badge> }
                    </div>
                    <ul className="space-y-3 mb-6 flex-grow">
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Tous les avantages Premium
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span
                          className="font-semibold text-indigo-300">{ plan.credits }</span> crédits
                        offerts
                      </li>
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Cosmétiques exclusifs mensuels
                      </li>
                    </ul>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className={ `w-full ${ plan.popular ? 'bg-purple-600 hover:bg-purple-700': 'bg-indigo-600 hover:bg-indigo-700' }` }
                        >
                          Acheter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBuyPremium(plan.id, 'stripe')}>Stripe</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBuyPremium(plan.id, 'paypal')}>PayPal</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              )) }
            </div>
          </div>

          {/* Premium Benefits */ }
          <div>
            <h2
              className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Avantages Premium
            </h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              { premiumBenefits.map((benefit) => (
                <Card
                  key={ benefit.id }
                  className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 hover:border-purple-500/50 transition-all p-6"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                      { getIcon(benefit.icon) }
                    </div>
                    <h3
                      className="text-lg font-semibold">{ benefit.title }</h3>
                  </div>
                  <p className="text-gray-400">{ benefit.description }</p>
                </Card>
              )) }
            </div>
          </div>
        </TabsContent>

        {/* Credits Tab */ }
        <TabsContent value="credits" className="mt-0">
          <h2
            className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Acheter des Crédits
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            { creditsPacks.map((pack) => (
              <Card
                key={ pack.id }
                className={ `overflow-hidden bg-gray-800/50 backdrop-blur-sm border ${
                  pack.popular ? 'border-indigo-500 shadow-lg shadow-indigo-500/20': 'border-indigo-500/30'
                } transition-all h-full flex flex-col` }
              >
                { pack.popular && (
                  <div
                    className="bg-indigo-500 text-white text-center py-1 font-medium">MEILLEURE
                    OFFRE</div>
                ) }
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4">
                    <div
                      className="text-3xl font-bold text-white mb-1">{ pack.credits }</div>
                    <div className="text-indigo-300 font-medium">Crédits</div>
                  </div>

                  { pack.bonus > 0 && <Badge
                    className="mb-4 bg-green-500">+{ pack.bonus } BONUS</Badge> }

                  <div className="text-2xl font-bold mb-6">{ pack.price }€
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={ `w-full ${ pack.popular ? 'bg-indigo-600 hover:bg-indigo-700': 'bg-gray-700 hover:bg-gray-600' }` }
                      >
                        Acheter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBuyCredits(pack.id, 'stripe')}>Stripe</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBuyCredits(pack.id, 'paypal')}>PayPal</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            )) }
          </div>
        </TabsContent>

        {/* Gift Tab */ }
        <TabsContent value="gift" className="mt-0">
          <h2
            className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-red-500">
            Offrir à un Ami
          </h2>

          <Card
            className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Que souhaitez-vous
                  offrir ?</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="gift-credits"
                      name="gift-type"
                      value="credits"
                      checked={ giftType === 'credits' }
                      onChange={ () => setGiftType('credits') }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600"
                    />
                    <label htmlFor="gift-credits" className="ml-2 block">
                      Des crédits
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="gift-premium"
                      name="gift-type"
                      value="premium"
                      checked={ giftType === 'premium' }
                      onChange={ () => setGiftType('premium') }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600"
                    />
                    <label htmlFor="gift-premium" className="ml-2 block">
                      Un abonnement Premium
                    </label>
                  </div>
                </div>

                { giftType === 'credits' ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">Montant de crédits</h4>
                    <div className="grid grid-cols-3 gap-3">
                      { ['100', '500', '1000', '2500', '5000', '10000'].map((amount) => (
                        <Button
                          key={ amount }
                          variant={ giftAmount === amount ? 'default': 'outline' }
                          onClick={ () => setGiftAmount(amount) }
                          className={ giftAmount === amount ? 'bg-indigo-600': '' }
                        >
                          { amount }
                        </Button>
                      )) }
                    </div>
                  </div>
                ): (
                  <div className="space-y-4">
                    <h4 className="font-medium">Durée de l'abonnement</h4>
                    <div className="grid grid-cols-3 gap-3">
                      { ['1 Mois', '3 Mois', '12 Mois'].map((duration) => (
                        <Button
                          key={ duration }
                          variant={ giftAmount === duration ? 'default': 'outline' }
                          onClick={ () => setGiftAmount(duration) }
                          className={ giftAmount === duration ? 'bg-purple-600': '' }
                        >
                          { duration }
                        </Button>
                      )) }
                    </div>
                  </div>
                ) }
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">À qui souhaitez-vous
                  l'offrir ?</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="recipient" className="block mb-2">
                      Pseudo du joueur
                    </label>
                    <Input
                      id="recipient"
                      placeholder="Entrez le pseudo du joueur"
                      value={ giftRecipient }
                      onChange={ (e) => setGiftRecipient(e.target.value) }
                      className="bg-gray-700/50 border-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      id="message"
                      placeholder="Ajouter un message personnel"
                      rows={ 3 }
                      className="w-full rounded-md bg-gray-700/50 border border-indigo-500/30 p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 12v10H4V12"/>
                      <path d="M2 7h20v5H2z"/>
                      <path d="M12 22V7"/>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                    </svg>
                    Offrir { giftType === 'credits' ? `${ giftAmount } Crédits`: `Premium ${ giftAmount }` }
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Transactions Tab */ }
        <TabsContent value="transactions" className="mt-0">
          <h2
            className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Historique des Transactions
          </h2>

          <Card
            className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50">
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Transaction
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Montant
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Crédits
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  { transactions.map((transaction) => (
                    <tr key={ transaction.id } className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        { new Date(transaction.createdAt).toLocaleDateString() }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div
                          className="font-medium">{ transaction.item?.name || transaction.premiumPlan?.name || transaction.creditsPack?.credits }</div>
                        { transaction.type === 'gift_sent' && (
                          <div className="text-xs text-gray-400">Envoyé
                          à { transaction.recipient?.nickname }</div>
                        ) }
                        { transaction.type === 'gift_received' && (
                          <div className="text-xs text-gray-400">Reçu
                          de { transaction.sender?.nickname }</div>
                        ) }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        { transaction.price && parseInt(transaction.price) > 0 ? `${ transaction.price }€`: '-' }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            transaction.credits && transaction.credits > 0 ? 'text-green-400': transaction.credits && transaction.credits < 0 ? 'text-red-400': ''
                          }
                        >
                          { transaction.credits && transaction.credits > 0 ? `+${ transaction.credits }`: transaction.credits }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge
                          className={
                            transaction.status === 'completed'
                              ? 'bg-green-500'
                              : transaction.status === 'pending'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }
                        >
                          { transaction.status === 'completed'
                            ? 'Complété'
                            : transaction.status === 'pending'
                              ? 'En attente'
                              : 'Échoué' }
                        </Badge>
                      </td>
                    </tr>
                  )) }
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default PremiumCredits
